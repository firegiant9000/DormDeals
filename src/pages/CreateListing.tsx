import { useState, useEffect } from 'react'
import { X, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedFeature from '@/components/ProtectedFeature'
import { createListing } from '@/services/listingService'
import type { UserType } from '@/types/user'
import { useAuth } from '@/context/AuthContext'
import { auth, db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

type DebugState = {
  lastStep?: string
  code?: string
  message?: string
  ms?: number
}

const CreateListing = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugState, setDebugState] = useState<DebugState>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: [] as File[],
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // DEV env check on mount
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CREATE_LISTING] ENV', {
        HAS_API_KEY: !!import.meta.env.VITE_FIREBASE_API_KEY,
        PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      })
    }
  }, [])

  // Recover local draft on mount (run once)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('dd-create-draft')
      if (raw) {
        const parsed = JSON.parse(raw)
        setFormData((prev) => {
          // Only restore if form is empty
          if (!prev.title && !prev.description) {
            return {
              ...prev,
              title: parsed.title || '',
              description: parsed.description || '',
              price: parsed.price || '',
              category: parsed.category || '',
              condition: parsed.condition || '',
              location: parsed.location || '',
              images: [], // Don't restore files
            }
          }
          return prev
        })
        if (import.meta.env.DEV) toast('Recovered draft from local storage')
      }
    } catch (e) {
      if (import.meta.env.DEV) console.error('[CREATE_LISTING] draft:recover:error', e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, images: files }))
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.price || Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Price must be a number greater than 0'
    }
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.condition) errors.condition = 'Condition is required'
    if (!formData.images.length) errors.images = 'Please upload at least one photo'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)
    const t0 = performance.now()

    try {
      if (import.meta.env.DEV) {
        console.log('[CREATE_LISTING] submit:start', {
          title: formData.title,
          price: formData.price,
          category: formData.category,
          condition: formData.condition,
          imageCount: formData.images.length,
        })
      }

      const res = await createListing({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location?.trim(),
        images: formData.images,
      })

      const ms = Math.round(performance.now() - t0)

      if (res.ok) {
        if (import.meta.env.DEV) {
          console.log('[CREATE_LISTING] submit:success', { id: res.id, ms })
        }
        toast.success('Listing created!')
        // Clear draft on success
        try {
          localStorage.removeItem('dd-create-draft')
        } catch {}
        navigate(`/listing/${res.id}`)
      } else {
        if (import.meta.env.DEV) {
          console.error('[CREATE_LISTING] submit:fail', { res, ms })
          if (res.message) console.error('[CREATE_LISTING] error message:', res.message)
        }
        setDebugState({ lastStep: res.step, code: res.code, message: res.message, ms })
        toast.error(`Create failed [${res.code}] ${res.step}`)
      }
    } catch (err: any) {
      const ms = Math.round(performance.now() - t0)
      if (import.meta.env.DEV) {
        console.error('[CREATE_LISTING] submit:exception', err)
      }
      setDebugState({ lastStep: 'exception', code: 'unknown', message: err?.message, ms })
      toast.error('Create failed [unknown] validate')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const draft = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        // Do NOT store files; store their names for context
        imageNames: formData.images.map((f) => f.name),
        savedAt: Date.now(),
      }

      // Always save to localStorage
      localStorage.setItem('dd-create-draft', JSON.stringify(draft))

      // If signed in, also save to Firestore
      if (isAuthenticated && auth.currentUser) {
        try {
          await addDoc(collection(db, 'drafts'), {
            ownerId: auth.currentUser.uid,
            title: formData.title,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            condition: formData.condition,
            location: formData.location,
            imageNames: formData.images.map((f) => f.name),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          toast.success('Draft saved')
        } catch (firestoreError: any) {
          // Firestore save failed, but localStorage succeeded
          if (import.meta.env.DEV) {
            console.error('[CREATE_LISTING] draft:firestore:error', firestoreError)
          }
          toast.success('Draft saved locally')
        }
      } else {
        toast.success('Draft saved locally')
      }

      if (import.meta.env.DEV) {
        console.log('[CREATE_LISTING] draft:saved', draft)
      }
    } catch (e) {
      toast.error('Failed to save draft')
      if (import.meta.env.DEV) {
        console.error('[CREATE_LISTING] draft:error', e)
      }
    }
  }

  return (
    <ProtectedFeature requiredUserTypes={['regular', 'premium', 'admin'] as UserType[]} fallback={<div>Please log in</div>}>
      <div className="min-h-[100svh] bg-transparent text-body py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto rounded-2xl border border-surface bg-surface p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-body">Create Listing</h1>
              <button
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-body"
                onClick={() => navigate(-1)}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="dd-input"
                  placeholder="What are you selling?"
                />
                {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Price<span className="text-red-500">*</span>
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="dd-input"
                  placeholder="0.00"
                  inputMode="decimal"
                />
                {validationErrors.price && <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Category<span className="text-red-500">*</span>
                </label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="dd-input">
                  <option value="">Select…</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.category && <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Condition<span className="text-red-500">*</span>
                </label>
                <select name="condition" value={formData.condition} onChange={handleInputChange} className="dd-input">
                  <option value="">Select…</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
                {validationErrors.condition && <p className="text-red-500 text-sm mt-1">{validationErrors.condition}</p>}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Photos<span className="text-red-500">*</span>
                </label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="dd-input" />
                {validationErrors.images && <p className="text-red-500 text-sm mt-1">{validationErrors.images}</p>}
                <div className="mt-2 flex gap-2 flex-wrap">
                  {formData.images.map((_, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-body">
                      <Camera className="mr-1" size={14} /> {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="dd-input"
                  placeholder="Describe your item…"
                />
                {validationErrors.description && <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-body mb-2">Pickup Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="dd-input"
                  placeholder="e.g., UL Campus"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating…' : 'List Item'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleSaveDraft} disabled={isSubmitting}>
                  Save Draft
                </button>
              </div>
            </form>

            {/* Debug Panel (DEV only) */}
            {import.meta.env.DEV && debugState.lastStep && (
              <div className="mt-4 rounded-xl border border-dashed border-surface p-3 text-sm opacity-90 bg-gray-50 dark:bg-surface">
                <div className="font-medium mb-1 text-body">CreateListing Debug</div>
                <pre className="whitespace-pre-wrap break-words text-xs text-body">
                  {JSON.stringify(debugState, null, 2)}
                </pre>
                <div className="text-xs text-muted-foreground mt-2">
                  Watch console for [CREATE_LISTING] logs & Network tab failures.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedFeature>
  )
}

export default CreateListing
