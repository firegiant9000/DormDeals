import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedFeature from '../components/ProtectedFeature'
import { apiService } from '../services/apiService'
import { CreateListingForm, ItemCondition, ItemCategory } from '../types'

const CreateListing = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: [] as File[]
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const categories = [
    'Electronics',
    'Books',
    'Appliances',
    'Furniture',
    'Clothing',
    'Sports & Recreation',
    'Other'
  ]

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Creating listing with data:', formData)
    
    // Clear previous validation errors
    setValidationErrors({})
    
    // Validate required fields
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0'
    }
    
    if (!formData.category) {
      errors.category = 'Category is required'
    }
    
    if (!formData.condition) {
      errors.condition = 'Condition is required'
    }
    
    if (formData.images.length === 0) {
      errors.images = 'Please upload at least one photo'
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      // Map form data to CreateListingForm format
      const conditionMap: Record<string, ItemCondition> = {
        'New': ItemCondition.NEW,
        'Like New': ItemCondition.LIKE_NEW,
        'Good': ItemCondition.GOOD,
        'Fair': ItemCondition.FAIR,
        'Poor': ItemCondition.POOR
      }

      const categoryMap: Record<string, ItemCategory> = {
        'Electronics': ItemCategory.ELECTRONICS,
        'Books': ItemCategory.BOOKS,
        'Appliances': ItemCategory.APPLIANCES,
        'Furniture': ItemCategory.FURNITURE,
        'Clothing': ItemCategory.CLOTHING,
        'Sports & Recreation': ItemCategory.SPORTS,
        'Other': ItemCategory.OTHER
      }

      const listingForm: CreateListingForm = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        condition: conditionMap[formData.condition] || ItemCondition.GOOD,
        category: categoryMap[formData.category] || ItemCategory.OTHER,
        images: formData.images,
        location: formData.location.trim() || 'UL Campus',
        pickupAvailable: true,
        deliveryAvailable: false,
        tags: []
      }

      const response = await apiService.createListing(listingForm)

      if (response.success && response.data) {
        toast.success('Listing created successfully!')
        // Navigate to the new listing page
        navigate(`/listing/${response.data.id}`, { state: { listing: response.data } })
      } else {
        toast.error(response.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('An error occurred while creating the listing. Please try again.')
    }
  }

  return (
    <ProtectedFeature feature="create_listing" upgradeMessage="Please sign in to create a listing.">
      <div className="min-h-[100svh] bg-transparent text-body py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="dd-card bg-surface border-surface"
          >
          {/* Header */}
          <div className="border-b border-surface px-6 py-4">
            <h1 className="text-2xl font-bold text-body">Create New Listing</h1>
            <p className="text-muted">List your item for sale to fellow UL students</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Photos <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl border-2 border-dashed border-surface bg-surface p-6 text-center text-muted hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-muted mx-auto mb-2" />
                  <p className="text-body mb-1">Click to upload photos</p>
                  <p className="text-sm text-muted">PNG, JPG up to 10MB each</p>
                </label>
              </div>
              {validationErrors.images && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.images}</p>
              )}
              
              {/* Preview Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What are you selling?"
                className="dd-input"
                required
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="dd-input pl-8"
                    required
                  />
                </div>
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="dd-input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
                )}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {conditions.map(condition => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={formData.condition === condition}
                      onChange={handleInputChange}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm text-body">{condition}</span>
                  </label>
                ))}
              </div>
              {validationErrors.condition && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.condition}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
                rows={4}
                className="dd-input"
                required
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-body mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., UL Campus, Lafayette, LA"
                className="dd-input"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-surface">
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                List Item
              </button>
              <button
                type="button"
                className="btn-secondary"
              >
                Save Draft
              </button>
            </div>
          </form>
          </motion.div>
        </div>
      </div>
    </ProtectedFeature>
  )
}

export default CreateListing
