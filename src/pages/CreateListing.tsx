import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Camera, DollarSign } from 'lucide-react'

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: [] as File[]
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    // Form submitted successfully
  }

  return (
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
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-body mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="dd-input pl-10"
                    required
                  />
                </div>
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
  )
}

export default CreateListing
