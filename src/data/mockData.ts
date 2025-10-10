import { Category, Condition } from '@/utils/helpers'

// Mock user data
export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@louisiana.edu',
  phone: '(555) 123-4567',
  location: 'UL Campus',
  joinedDate: '2023-08-15',
  rating: 4.8,
  totalSales: 12,
  profileImage: null,
  isVerified: true
}

// Mock items data
export const mockItems = [
  {
    id: '1',
    title: 'MacBook Pro 13" 2020',
    description: 'Selling my MacBook Pro 13" from 2020. It\'s been well taken care of and works perfectly. Comes with charger and original box. Perfect for students who need a reliable laptop for their studies.',
    price: 800,
    originalPrice: 1200,
    category: 'Electronics' as Category,
    condition: 'Good' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: mockUser,
    posted: '2024-01-15T10:30:00Z',
    views: 45,
    status: 'Active',
    tags: ['Laptop', 'Apple', 'Student', 'Computer'],
    location: 'UL Campus'
  },
  {
    id: '2',
    title: 'Calculus Textbook - Stewart 8th Edition',
    description: 'Calculus: Early Transcendentals by James Stewart, 8th Edition. Book is in excellent condition with minimal highlighting. Perfect for Calculus I and II courses.',
    price: 50,
    originalPrice: 200,
    category: 'Books' as Category,
    condition: 'Excellent' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: {
      ...mockUser,
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah.smith@louisiana.edu'
    },
    posted: '2024-01-10T14:20:00Z',
    views: 23,
    status: 'Active',
    tags: ['Textbook', 'Math', 'Calculus', 'Stewart'],
    location: 'UL Campus'
  },
  {
    id: '3',
    title: 'Mini Fridge - 3.2 Cu Ft',
    description: 'Compact mini fridge perfect for dorm rooms. Features adjustable shelves and a small freezer compartment. Great condition, cleaned and ready to use.',
    price: 120,
    originalPrice: 180,
    category: 'Appliances' as Category,
    condition: 'Good' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: {
      ...mockUser,
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@louisiana.edu'
    },
    posted: '2024-01-12T09:15:00Z',
    views: 67,
    status: 'Active',
    tags: ['Fridge', 'Dorm', 'Compact', 'Appliance'],
    location: 'UL Campus'
  },
  {
    id: '4',
    title: 'Coffee Maker - Keurig K-Mini',
    description: 'Keurig K-Mini single serve coffee maker. Perfect for busy students who need their morning coffee. Includes reusable K-cup for eco-friendly brewing.',
    price: 35,
    originalPrice: 80,
    category: 'Appliances' as Category,
    condition: 'Excellent' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: {
      ...mockUser,
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@louisiana.edu'
    },
    posted: '2024-01-08T16:45:00Z',
    views: 34,
    status: 'Sold',
    tags: ['Coffee', 'Keurig', 'K-Mini', 'Beverage'],
    location: 'UL Campus'
  },
  {
    id: '5',
    title: 'Office Chair - Ergonomic',
    description: 'Comfortable ergonomic office chair perfect for long study sessions. Adjustable height and lumbar support. Great for dorm room or apartment.',
    price: 75,
    originalPrice: 150,
    category: 'Furniture' as Category,
    condition: 'Good' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: {
      ...mockUser,
      id: '5',
      name: 'Alex Chen',
      email: 'alex.chen@louisiana.edu'
    },
    posted: '2024-01-05T11:30:00Z',
    views: 28,
    status: 'Active',
    tags: ['Chair', 'Ergonomic', 'Office', 'Study'],
    location: 'UL Campus'
  },
  {
    id: '6',
    title: 'Psychology Textbook - Myers 12th Edition',
    description: 'Psychology by David Myers, 12th Edition. Used for PSYC 100. Book is in good condition with some highlighting and notes in margins.',
    price: 40,
    originalPrice: 120,
    category: 'Books' as Category,
    condition: 'Good' as Condition,
    images: ['/api/placeholder/600/400'],
    seller: {
      ...mockUser,
      id: '6',
      name: 'Jessica Wilson',
      email: 'jessica.wilson@louisiana.edu'
    },
    posted: '2024-01-03T13:20:00Z',
    views: 19,
    status: 'Active',
    tags: ['Psychology', 'Textbook', 'Myers', 'Social Science'],
    location: 'UL Campus'
  }
]

// Mock categories
export const mockCategories = [
  { id: '1', name: 'Electronics', count: 15 },
  { id: '2', name: 'Books', count: 42 },
  { id: '3', name: 'Appliances', count: 23 },
  { id: '4', name: 'Furniture', count: 18 },
  { id: '5', name: 'Clothing', count: 31 },
  { id: '6', name: 'Sports & Recreation', count: 12 },
  { id: '7', name: 'Other', count: 8 }
]

// Mock messages
export const mockMessages = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    itemId: '1',
    message: 'Hi! Is the MacBook still available?',
    timestamp: '2024-01-15T14:30:00Z',
    read: false
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    itemId: '1',
    message: 'Yes, it is! Would you like to see it in person?',
    timestamp: '2024-01-15T14:35:00Z',
    read: true
  },
  {
    id: '3',
    senderId: '2',
    receiverId: '1',
    itemId: '1',
    message: 'That would be great! When are you available?',
    timestamp: '2024-01-15T14:40:00Z',
    read: false
  }
]

// Mock favorites
export const mockFavorites = [
  {
    id: '1',
    userId: '1',
    itemId: '3',
    addedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    itemId: '5',
    addedAt: '2024-01-13T15:30:00Z'
  }
]
