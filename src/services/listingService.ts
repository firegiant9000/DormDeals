import { db, storage, auth } from '@/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, UploadMetadata } from 'firebase/storage'

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

function devLog(step: CreateListingStep, info: Record<string, unknown> = {}) {
  if (import.meta.env.DEV) {
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

export async function createListing(input: CreateListingInput): Promise<CreateListingResult> {
  // Short-circuit dev validate-only mode (for isolating UI vs. backend)
  const DEV_VALIDATE_ONLY = String(import.meta.env.VITE_LISTING_DEV_VALIDATE_ONLY || 'false') === 'true'
  const user = auth.currentUser

  devLog('validate', { hasUser: !!user, images: input.images?.length ?? 0 })
  if (!user) {
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
      // Upload images with per-file timeouts & metadata
      devLog('upload:start')
      const urls: string[] = []
      const baseTs = Date.now()

      for (let i = 0; i < (input.images?.length ?? 0); i++) {
        const file = input.images[i]
        const nameSafe = (file?.name || `img_${i}`).replace(/[^\w.\-]/g, '_')
        const unique = `${baseTs}_${i}`
        const path = `listings/${user.uid}/${unique}_${nameSafe}`
        devLog('upload:file', { index: i, name: file?.name, size: file?.size, type: file?.type, path })

        try {
          const sref = ref(storage, path)
          const metadata: UploadMetadata = { contentType: file.type || 'application/octet-stream' }

          // 10s timeout per file (tune if needed)
          const snap = await withTimeout(uploadBytes(sref, file, metadata), 10000, `uploadBytes(${i})`)
          const url = await withTimeout(getDownloadURL(sref), 8000, `getDownloadURL(${i})`)

          urls.push(url)
        } catch (err: any) {
          const raw = String(err?.code || err?.name || 'unknown')
          if (import.meta.env.DEV) {
            console.error('LISTING upload error', { index: i, code: raw, message: err?.message })
          }
          return { ok: false, code: mapCode(raw), step: 'upload:file', message: err?.message }
        }
      }

      devLog('upload:done', { count: urls.length })

      // Firestore write (guarded)
      try {
        devLog('firestore:start')
        const docRef = await withTimeout(
          addDoc(collection(db, 'listings'), {
            ownerId: user.uid,
            title: input.title.trim(),
            price: input.price,
            category: input.category,
            condition: input.condition,
            description: input.description.trim(),
            pickupLocation: input.location ?? '',
            imageUrls: urls,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isHidden: false,
            isFeatured: false,
          }),
          10000,
          'firestore.addDoc(listings)'
        )
        devLog('firestore:done', { id: docRef.id })
        return { ok: true, id: docRef.id, imageUrls: urls }
      } catch (err: any) {
        const raw = String(err?.code || err?.name || 'unknown')
        if (import.meta.env.DEV) {
          console.error('LISTING firestore error', { code: raw, message: err?.message })
        }
        return { ok: false, code: mapCode(raw), step: 'firestore:start', message: err?.message }
      }
    })()

    return await withTimeout(op, WHOLE_OP_MS, 'createListing-whole-op')
  } catch (err: any) {
    const raw = String(err?.code || err?.name || 'unknown')
    if (import.meta.env.DEV) {
      console.error('LISTING fatal', { code: raw, message: err?.message })
    }
    return { ok: false, code: mapCode(raw), step: 'validate', message: err?.message }
  }
}
