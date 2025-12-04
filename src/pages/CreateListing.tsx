import { useState } from 'react'
import { X, Camera, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedFeature from '@/components/ProtectedFeature'
import { createListing } from '@/services/listingService'
import type { UserType } from '@/types/user'

const CreateListing = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const categories = [
    'Electronics',
    'Books',
    'Appliances',
    'Furniture',
    'Clothing',
    'Sports & Recreation',
    'Other',
  ]

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    try {
      const res = await createListing({
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim(),
        images: formData.images,
      })

      const r: any = res
      if (r?.success || r?.ok) {
        const id = r.listingId ?? r.id
        toast.success('Listing created successfully!')
        if (id) navigate(`/listing/${id}`)
        setFormData({
          title: '',
          description: '',
          price: '',
          category: '',
          condition: '',
          location: '',
          images: [],
        })
      } else {
        const code = r?.errorCode ?? r?.code ?? 'unknown'
        const step = r?.failedStep ?? r?.step ?? 'unknown'
        const message = r?.message ?? `Create failed [${code}] ${step}`
        toast.error(message)
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedFeature requiredUserTypes={['regular', 'premium', 'admin'] as UserType[]} fallback={<div>Please log in</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Create Listing</h1>
            <button className="p-2 rounded hover:bg-gray-100" onClick={() => navigate(-1)}>
              <X />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="dd-input"
                placeholder="What are you selling?"
              />
              {validationErrors.title && <p className="text-red-500 text-sm">{validationErrors.title}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} />
                </span>
                <input
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="dd-input pl-8"
                  placeholder="0.00"
                  inputMode="decimal"
                />
              </div>
              {validationErrors.price && <p className="text-red-500 text-sm">{validationErrors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category<span className="text-red-500">*</span>
              </label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="dd-input">
                <option value="">Select…</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {validationErrors.category && <p className="text-red-500 text-sm">{validationErrors.category}</p>}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Condition<span className="text-red-500">*</span>
              </label>
              <select name="condition" value={formData.condition} onChange={handleInputChange} className="dd-input">
                <option value="">Select…</option>
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
              {validationErrors.condition && <p className="text-red-500 text-sm">{validationErrors.condition}</p>}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Photos<span className="text-red-500">*</span>
              </label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} />
              {validationErrors.images && <p className="text-red-500 text-sm">{validationErrors.images}</p>}
              <div className="mt-2 flex gap-2 flex-wrap">
                {formData.images.map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs">
                    <Camera className="mr-1" size={14} /> {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
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
              {validationErrors.description && <p className="text-red-500 text-sm">{validationErrors.description}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Location</label>
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
              <button type="button" className="btn-secondary" disabled={isSubmitting}>
                Save Draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedFeature>
  )
}

export default CreateListing
