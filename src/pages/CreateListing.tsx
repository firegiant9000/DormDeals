import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Camera, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedFeature from '../components/ProtectedFeature'
import { useAuth } from '../context/AuthContext'
import { useAccessControl } from '../hooks/useAccessControl'
import { createListing } from '../services/listingsService'
import { getUserProfile } from '../services/userService'

const CreateListing = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isPremium } = useAccessControl()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: [] as File[],
    isFeatured: false
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  // Convert File to Base64 string
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = result.split(',')[1] || result
        resolve(base64String)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsDataURL(file)
    })
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

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      // Get user info
      if (!user?.id || !user?.email) {
        toast.error('Please sign in to create a listing')
        return
      }

      // Get user profile for seller info
      let sellerInfo
      try {
        const profile = await getUserProfile(user.id)
        sellerInfo = {
          email: user.email,
          name: profile?.displayName || user.name || user.email.split('@')[0],
          school: profile?.school || user.school || 'University of Louisiana',
          rating: profile?.rating || 0,
          reviewCount: profile?.reviewCount || 0,
          totalSales: profile?.totalSales || 0,
          isVerified: profile?.isVerified || false,
          joinDate: profile?.createdAt ? new Date(profile.createdAt) : new Date()
        }
      } catch {
        // Use minimal seller info if profile fetch fails
        sellerInfo = {
          email: user.email,
          name: user.name || user.email.split('@')[0],
          school: user.school || 'University of Louisiana',
          rating: 0,
          reviewCount: 0,
          totalSales: 0,
          isVerified: false,
          joinDate: new Date()
        }
      }

      // Map condition to Firestore format (lowercase)
      const conditionMap: Record<string, string> = {
        'New': 'new',
        'Like New': 'like_new',
        'Good': 'good',
        'Fair': 'fair',
        'Poor': 'poor'
      }

      // Convert images to Base64 strings
      const imageBase64Strings = await Promise.all(
        formData.images.map(async (file) => {
          try {
            const base64String = await convertFileToBase64(file)
            // Return full data URL format
            // Format: "data:image/jpeg;base64,{base64String}"
            const mimeType = file.type || 'image/jpeg'
            return `data:${mimeType};base64,${base64String}`
          } catch (err) {
            console.error('Error converting image to Base64:', err)
            throw new Error(`Failed to convert image ${file.name} to Base64`)
          }
        })
      )

      // Prepare listing data for Firestore
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: conditionMap[formData.condition] || 'good',
        sellerId: user.id,
        images: imageBase64Strings,
        location: formData.location.trim() || 'UL Campus',
        pickupAvailable: true,
        deliveryAvailable: false,
        tags: [],
        isFeatured: formData.isFeatured && isPremium() ? true : false
      }

      // Create listing in Firestore
      const createdListing = await createListing(listingData, sellerInfo)

      if (createdListing && createdListing.id) {
        toast.success('Listing created successfully!')
        // Navigate to the new listing page
        navigate(`/listing/${createdListing.id}`, { state: { listing: createdListing } })
      } else {
        toast.error('Failed to create listing')
      }
    } catch (error: any) {
      console.error('Error creating listing:', error)
      toast.error(error?.message || 'An error occurred while creating the listing. Please try again.')
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
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="dd-input"
                    required
                  />
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
                      <option key={category} value={category}>
                        {category}
                      </option>
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

              {/* Feature Item Option - Show for all authenticated users */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-surface">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => {
                        if (!isPremium() && e.target.checked) {
                          // If not premium and trying to check, navigate to premium page
                          e.preventDefault()
                          navigate('/premium')
                          return
                        }
                        setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))
                      }}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-2">
                      <Crown className={`w-5 h-5 ${isPremium() ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isPremium() ? 'text-body' : 'text-gray-500'}`}>
                        Feature this item
                      </span>
                      {!isPremium() && (
                        <span className="text-sm text-gray-500">(Premium required)</span>
                      )}
                    </div>
                  </label>
                  {!isPremium() && (
                    <p className="text-sm text-gray-500 mt-2 ml-8">
                      Upgrade to Premium to feature your listings and get more visibility
                    </p>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-surface">
                <button type="submit" className="btn-primary flex-1">
                  List Item
                </button>
                <button type="button" className="btn-secondary">
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