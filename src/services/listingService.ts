import { db, storage, auth } from '@/firebase'
import { addDoc, collection, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, UploadMetadata, deleteObject } from 'firebase/storage'

type CreateListingStep =
  | 'validate'
  | 'upload:start'
  | 'upload:file'
  | 'upload:done'
  | 'firestore:start'
  | 'firestore:done'

export type CreateListingOk = { ok: true; id: string; imageUrls: string[] }
export type CreateListingFail = {
  ok: false
  code:
    | 'unauthenticated'
    | 'invalid-argument'
    | 'storage/unauthorized'
    | 'storage/quota-exceeded'
    | 'storage/retry-limit-exceeded'
    | 'storage/canceled'
    | 'storage/invalid-argument'
    | 'firestore/permission-denied'
    | 'firestore/unavailable'
    | 'deadline-exceeded'
    | 'unknown'
  step: CreateListingStep
  message?: string
}

export type CreateListingResult = CreateListingOk | CreateListingFail

export interface CreateListingInput {
  title: string
  price: number
  category: string
  condition: string
  description: string
  location?: string
  images: File[]
}

function isDebugMode(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')
}

function devLog(step: CreateListingStep, info: Record<string, unknown> = {}) {
  if (import.meta.env.DEV || isDebugMode()) {
    console.log('[LISTING]', step, { ...info, ts: Date.now() })
  }
}

function mapCode(raw: string): CreateListingFail['code'] {
  if (raw === 'auth/unauthenticated' || raw === 'unauthenticated') return 'unauthenticated'
  if (raw === 'deadline-exceeded') return 'deadline-exceeded'
  if (raw === 'invalid-argument') return 'invalid-argument'
  if (raw.startsWith('storage/')) {
    const known: CreateListingFail['code'][] = [
      'storage/unauthorized',
      'storage/quota-exceeded',
      'storage/retry-limit-exceeded',
      'storage/canceled',
      'storage/invalid-argument',
    ]
    return (known.includes(raw as any) ? raw : 'storage/invalid-argument') as CreateListingFail['code']
  }
  if (raw.startsWith('firestore/')) {
    const known: CreateListingFail['code'][] = [
      'firestore/permission-denied',
      'firestore/unavailable',
    ]
    return (known.includes(raw as any) ? raw : 'firestore/unavailable') as CreateListingFail['code']
  }
  return 'unknown'
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      const err: any = new Error(`timeout after ${ms}ms @ ${label}`)
      err.code = 'deadline-exceeded'
      reject(err)
    }, ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      }
    )
  })
}

function getValidateOnlyFlag(): boolean {
  // LocalStorage or ?validateOnly=1
  const ls = (typeof localStorage !== 'undefined' && localStorage.getItem('VITE_LISTING_DEV_VALIDATE_ONLY')) || 'false'
  const qp = (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('validateOnly')) || '0'
  const requested = (ls === 'true') || (qp === '1')

  // Allowlist (comma-separated UIDs in env); only allow if current user matches
  const allow = String(import.meta.env.VITE_VALIDATE_ONLY_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean)
  const uid = (auth && auth.currentUser && auth.currentUser.uid) || ''
  const isAllowed = allow.length === 0 ? false : allow.includes(uid)

  return requested && isAllowed
}

export async function createListing(input: CreateListingInput): Promise<CreateListingResult> {
  // Short-circuit validate-only mode (for isolating UI vs. backend) - production-safe with allowlist
  const debug = import.meta.env.DEV || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'))
  const validateOnly = debug && (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('validateOnly'))
  const DEV_VALIDATE_ONLY = validateOnly || getValidateOnlyFlag()
  const user = auth.currentUser

  // Pre-flight bucket sanity check
  if (debug) {
    console.log('[LISTING] start', {
      uid: user?.uid || null,
      imageCount: input.images?.length || 0,
      price: input.price,
      priceType: typeof input.price,
      priceIsFinite: Number.isFinite(input.price),
    })
  }

  devLog('validate', { hasUser: !!user, images: input.images?.length ?? 0 })
  if (!user) {
    if (debug) {
      console.warn('[LISTING] auth.currentUser is null')
    }
    return { ok: false, code: 'unauthenticated', step: 'validate', message: 'User not signed in' }
  }
  if (!input.title?.trim() || !input.category || !input.condition || Number.isNaN(input.price)) {
    return { ok: false, code: 'invalid-argument', step: 'validate', message: 'Missing fields' }
  }

  if (DEV_VALIDATE_ONLY) {
    devLog('upload:done', { count: 0, devValidateOnly: true })
    devLog('firestore:done', { id: 'DEV_ONLY' })
    return { ok: true, id: 'DEV_ONLY', imageUrls: [] }
  }

  try {
    // Entire op watchdog (e.g., no hung UI)
    const WHOLE_OP_MS = 30000

    const op = (async (): Promise<CreateListingResult> => {
      // Fast-fail for missing storage bucket
      if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
        if (import.meta.env.DEV) console.error('Missing VITE_FIREBASE_STORAGE_BUCKET')
        return { ok: false, code: 'invalid-argument', step: 'upload:start', message: 'No storage bucket configured' }
      }

      // Upload images with per-file timeouts & metadata
      devLog('upload:start')
      const urls: string[] = []

      for (let i = 0; i < (input.images?.length ?? 0); i++) {
        const file = input.images[i]
        const uniqueId = `${Date.now()}_${i}_${Math.floor(performance.now() * 1000)}`
        const filename = file.name || `image_${i}.jpg`
        const path = `listings/${user.uid}/${uniqueId}_${filename}` // never empty
        if (debug) console.log('[LISTING] path', path)
        devLog('upload:file', { index: i, name: file?.name, size: file?.size, type: file?.type, path })

        try {
          const sref = ref(storage, path)

          // uploadBytes will infer metadata from File, but on some browsers type can be ''
          const metadata = file.type ? ({ contentType: file.type } as UploadMetadata) : undefined

          // 10s timeout per file (tune if needed)
          const snap = await withTimeout(uploadBytes(sref, file, metadata), 10000, `uploadBytes(${i})`)
          const url = await withTimeout(getDownloadURL(snap.ref), 8000, `getDownloadURL(${i})`)

          if (debug) {
            console.log('[LISTING] downloadURL', { index: i, url })
          }
          urls.push(url)
        } catch (err: any) {
          const raw = String(err?.code || err?.name || 'unknown')
          if (debug) {
            console.error('[CREATE_LISTING ERROR]', {
              rawCode: err?.code,
              name: err?.name,
              message: err?.message,
              stack: err?.stack,
            })
          }
          const step = (raw === 'storage/invalid-argument' || raw === 'invalid-argument') ? 'upload:file' : 'upload:file'
          return { ok: false, code: mapCode(raw), step, message: err?.message }
        }
      }

      devLog('upload:done', { count: urls.length })

      // Firestore write (guarded)
      try {
        devLog('firestore:start')
        
        // Ensure price is a number
        const price = Number(input.price);
        if (!Number.isFinite(price)) throw new Error('Invalid price');
        
        const docRef = await withTimeout(
          addDoc(collection(db, 'listings'), {
            ownerId: user.uid,
            title: input.title.trim(),
            description: input.description?.trim() ?? '',
            price,
            category: input.category,
            condition: input.condition,
            imageUrls: urls,
            status: 'active',
            createdAt: serverTimestamp()
          }),
          10000,
          'firestore.addDoc(listings)'
        )
        devLog('firestore:done', { id: docRef.id })
        if (debug) {
          console.log('[LISTING] write', {
            id: docRef.id,
            ownerId: user.uid,
            count: urls.length,
            createdAt: 'serverTimestamp',
            status: 'active'
          })
        }
        return { ok: true, id: docRef.id, imageUrls: urls }
      } catch (err: any) {
        const raw = String(err?.code || err?.name || 'unknown')
        if (debug || import.meta.env.DEV) {
          console.error('[LISTING] firestore error', {
            code: raw,
            message: err?.message,
            stack: err?.stack,
          })
        }
        return { ok: false, code: mapCode(raw), step: 'firestore:start', message: err?.message }
      }
    })()

    return await withTimeout(op, WHOLE_OP_MS, 'createListing-whole-op')
  } catch (err: any) {
    const raw = String(err?.code || err?.name || 'unknown')
    if (isDebugMode() || import.meta.env.DEV) {
      console.error('[LISTING] fatal', {
        code: raw,
        message: err?.message,
        stack: err?.stack,
      })
    }
    return { ok: false, code: mapCode(raw), step: 'validate', message: err?.message }
  }
}

export async function deleteListing(listingId: string, requesterUid: string) {
  const dref = doc(db, 'listings', listingId);
  const snap = await getDoc(dref);
  if (!snap.exists()) throw new Error('Listing does not exist');
  const data = snap.data() as any;
  if (data.ownerId !== requesterUid) throw new Error('Forbidden');

  const imageUrls: string[] = Array.isArray(data.imageUrls) ? data.imageUrls : [];

  // best-effort delete storage files
  await Promise.allSettled(imageUrls.map(url => {
    try {
      const r = ref(storage, url);
      return deleteObject(r);
    } catch { return Promise.resolve(); }
  }));

  await deleteDoc(dref);
}
