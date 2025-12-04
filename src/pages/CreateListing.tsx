import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import ProtectedFeature from '@/components/ProtectedFeature'
import { UserType } from '@/types/commerce'
import { createListing } from '@/services/listingService'

type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'

const CreateListing: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'Good' as ItemCondition,
    location: '',
    images: [] as File[],
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: files }))
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    const priceNum = Number(formData.price)
    if (!formData.price || Number.isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be a number greater than 0'
    }
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.condition) errors.condition = 'Condition is required'
    if (formData.images.length === 0) errors.images = 'Please upload at least one photo'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      condition: formData.condition,
      location: formData.location.trim(),
      images: formData.images,
    }

    const res = await createListing(payload)
    setIsSubmitting(false)

    if (res.ok) {
      toast.success('Listing created!')
      navigate(`/listing/${res.id}`)
    } else {
      const label = `[${res.code ?? 'unknown'}] ${res.step ?? 'validate'}`
      toast.error(`Create failed ${label}`)
      if (import.meta.env.DEV) console.error('[CREATE_LISTING] fail', res)
    }
  }

  return (
    <ProtectedFeature
      requiredUserTypes={[UserType.Regular, UserType.Premium, UserType.Admin]}
      fallback={<div className="p-6 text-center">Please log in</div>}
    >
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">Create Listing</h1>

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Mini fridge"
              className="w-full rounded-md border px-3 py-2"
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm">{validationErrors.title}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="e.g., 75"
              className="w-full rounded-md border px-3 py-2"
              inputMode="decimal"
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm">{validationErrors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Appliances">Appliances</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Sports & Recreation">Sports & Recreation</option>
              <option value="Other">Other</option>
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-sm">{validationErrors.category}</p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full rounded-md border px-3 py-2"
            >
              {(['New', 'Like New', 'Good', 'Fair', 'Poor'] as ItemCondition[]).map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {validationErrors.condition && (
              <p className="text-red-500 text-sm">{validationErrors.condition}</p>
            )}
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Photos <span className="text-red-500">*</span>
            </label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} />
            {validationErrors.images && (
              <p className="text-red-500 text-sm">{validationErrors.images}</p>
            )}
            {formData.images.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {formData.images.length} file(s) selected
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item…"
              rows={4}
              className="w-full rounded-md border px-3 py-2"
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm">{validationErrors.description}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Pickup Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., UL Campus"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* Submit */}
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
    </ProtectedFeature>
  )
}

export default CreateListing
