import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dlog } from '@/utils/debug';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  ArrowLeft,
  DollarSign,
  MapPin,
  Calendar
} from 'lucide-react';
import { Item, User } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils/helpers';

// Items for each conversation context
const mockItems: { [conversationId: string]: Item } = {
  '1': {
    id: 'macbook-1',
    title: 'MacBook Pro 13-inch M2',
    description: 'Excellent condition MacBook Pro with M2 chip. Perfect for students. Includes original charger and box. No scratches or dents. Used for one semester only.',
    price: 1200,
    originalPrice: 1599,
    condition: 'LIKE_NEW' as any,
    category: 'ELECTRONICS' as any,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'
    ],
    seller: {
      id: 'user1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      rating: 4.8,
      totalSales: 15,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-01-15',
      joinedDate: '2023-01-15',
      reviewCount: 12,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: true,
    deliveryFee: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    posted: '2024-01-15',
    status: 'ACTIVE' as any,
    views: 45,
    likes: 8,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['laptop', 'macbook', 'm2', 'student', 'electronics'],
    pickupMethod: 'BOTH' as any
  },
  '2': {
    id: 'desk-1',
    title: 'Study Desk with Drawers',
    description: 'Perfect study desk for dorm rooms. Includes 3 drawers for storage. Great condition, no damage. Easy to assemble.',
    price: 80,
    originalPrice: 120,
    condition: 'GOOD' as any,
    category: 'FURNITURE' as any,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500'
    ],
    seller: {
      id: 'user2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      rating: 4.9,
      totalSales: 8,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-03-20',
      joinedDate: '2023-03-20',
      reviewCount: 6,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    posted: '2024-01-10',
    status: 'SOLD' as any,
    views: 23,
    likes: 5,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['desk', 'study', 'furniture', 'dorm'],
    pickupMethod: 'PICKUP' as any
  },
  '3': {
    id: 'textbooks-1',
    title: 'Calculus & Physics Textbook Bundle',
    description: 'Complete set of textbooks for Calculus and Physics courses. Both books in excellent condition with minimal highlighting. Perfect for current semester.',
    price: 150,
    originalPrice: 200,
    condition: 'GOOD' as any,
    category: 'TEXTBOOKS' as any,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
    ],
    seller: {
      id: 'user3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      rating: 4.7,
      totalSales: 12,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-02-10',
      joinedDate: '2023-02-10',
      reviewCount: 8,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: true,
    deliveryFee: 3,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    posted: '2024-01-12',
    status: 'ACTIVE' as any,
    views: 18,
    likes: 3,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['textbooks', 'calculus', 'physics', 'academic'],
    pickupMethod: 'BOTH' as any
  },
  '4': {
    id: 'fridge-1',
    title: 'Mini Fridge for Dorm',
    description: 'Perfect mini fridge for dorm rooms. Quiet operation, energy efficient. Great condition, works perfectly. Includes ice tray.',
    price: 120,
    originalPrice: 180,
    condition: 'LIKE_NEW' as any,
    category: 'APPLIANCES' as any,
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500'
    ],
    seller: {
      id: 'user4',
      name: 'Alex Rodriguez',
      email: 'alex@example.com',
      rating: 4.6,
      totalSales: 20,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-01-05',
      joinedDate: '2023-01-05',
      reviewCount: 15,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: true,
    deliveryFee: 8,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    posted: '2024-01-08',
    status: 'SOLD' as any,
    views: 35,
    likes: 7,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['fridge', 'mini', 'dorm', 'appliance'],
    pickupMethod: 'BOTH' as any
  },
  '5': {
    id: 'coffee-1',
    title: 'Coffee Maker for Dorm',
    description: 'Compact coffee maker perfect for dorm life. Makes excellent coffee, easy to use and clean. Great for early morning classes.',
    price: 45,
    originalPrice: 70,
    condition: 'GOOD' as any,
    category: 'APPLIANCES' as any,
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'
    ],
    seller: {
      id: 'user5',
      name: 'Jessica Park',
      email: 'jessica@example.com',
      rating: 4.5,
      totalSales: 6,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-04-15',
      joinedDate: '2023-04-15',
      reviewCount: 4,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    posted: '2024-01-20',
    status: 'ACTIVE' as any,
    views: 12,
    likes: 2,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['coffee', 'maker', 'dorm', 'appliance'],
    pickupMethod: 'PICKUP' as any
  },
  '6': {
    id: 'bike-1',
    title: 'Campus Bike - Mountain Bike',
    description: 'Reliable mountain bike perfect for getting around campus. Well maintained, new tires, great brakes. Includes bike lock.',
    price: 180,
    originalPrice: 250,
    condition: 'GOOD' as any,
    category: 'SPORTS' as any,
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500'
    ],
    seller: {
      id: 'user6',
      name: 'David Kim',
      email: 'david@example.com',
      rating: 4.8,
      totalSales: 10,
      isVerified: true,
      school: 'University of Louisiana',
      joinDate: '2023-02-28',
      joinedDate: '2023-02-28',
      reviewCount: 7,
      profilePicture: '/api/placeholder/40/40'
    } as User,
    location: 'Lafayette, LA',
    pickupAvailable: true,
    deliveryAvailable: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    posted: '2024-01-05',
    status: 'SOLD' as any,
    views: 28,
    likes: 6,
    isLiked: false,
    isInCart: false,
    isInWishlist: false,
    tags: ['bike', 'mountain', 'campus', 'transportation'],
    pickupMethod: 'PICKUP' as any
  }
};

// Mock data for conversations and messages
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    size: number;
  }[];
}

// Security and validation utilities
const validateMessage = (text: string, attachments?: File[]): { isValid: boolean; error?: string } => {
  // Message length validation
  if (text.length > 1000) {
    return { isValid: false, error: 'Message is too long (max 1000 characters)' };
  }
  
  // Attachment validation
  if (attachments && attachments.length > 0) {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    for (const file of attachments) {
      if (file.size > maxFileSize) {
        return { isValid: false, error: 'File size too large (max 10MB)' };
      }
      if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid file type. Only images are allowed.' };
      }
    }
  }
  
  return { isValid: true };
};

const sanitizeMessage = (text: string): string => {
  // Basic XSS prevention
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
  isTyping?: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
    },
    lastMessage: {
      text: 'Hey! Is the MacBook Pro still available?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      senderId: 'user1',
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'Mike Chen',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    lastMessage: {
      text: 'Thanks for the quick pickup! The desk is perfect.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      senderId: 'current',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    participant: {
      id: 'user3',
      name: 'Emma Davis',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
    },
    lastMessage: {
      text: 'Can we meet tomorrow at 3pm for the textbooks?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      senderId: 'user3',
      isRead: true,
    },
    unreadCount: 0,
    isTyping: true,
  },
  {
    id: '4',
    participant: {
      id: 'user4',
      name: 'Alex Rodriguez',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    lastMessage: {
      text: 'The mini fridge works perfectly! Thanks again.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      senderId: 'user4',
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '5',
    participant: {
      id: 'user5',
      name: 'Jessica Park',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
    },
    lastMessage: {
      text: 'Is the coffee maker still available?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      senderId: 'user5',
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: '6',
    participant: {
      id: 'user6',
      name: 'David Kim',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    lastMessage: {
      text: 'The bike is in great condition. Thanks!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      senderId: 'user6',
      isRead: true,
    },
    unreadCount: 0,
  },
];

const mockMessages: { [conversationId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'Hi! I saw your MacBook Pro listing. Is it still available?',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes, it is! Are you interested in buying it?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Perfect! What condition is it in? Any scratches?',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      text: 'It\'s in excellent condition, barely used. No scratches or dents. I can send you some photos if you\'d like.',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isRead: true,
      type: 'text',
    },
    {
      id: '5',
      text: 'Hey! Is the MacBook Pro still available?',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
      type: 'text',
    },
  ],
  '2': [
    {
      id: '1',
      text: 'Hi! I\'m interested in your study desk. Is it still available?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes! It\'s a great desk, perfect for studying. When would you like to pick it up?',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Can I come by tomorrow afternoon? Around 2pm?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      text: 'Perfect! I\'ll be at the dorm. Text me when you\'re on your way.',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '5',
      text: 'Thanks for the quick pickup! The desk is perfect.',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: true,
      type: 'text',
    },
  ],
  '3': [
    {
      id: '1',
      text: 'Hi! I saw your textbook bundle for Calculus and Physics. Are they still available?',
      senderId: 'user3',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes! Both books are in great condition. Are you taking those classes this semester?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Yes! I\'m taking both this semester. Can we meet tomorrow at 3pm?',
      senderId: 'user3',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      text: 'Perfect! I\'ll be at the library. See you then!',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isRead: true,
      type: 'text',
    },
  ],
  '4': [
    {
      id: '1',
      text: 'Hi! Is your mini fridge still available?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes! It\'s perfect for dorm rooms. Works great and is very quiet.',
      senderId: 'user4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Great! Can I pick it up this weekend?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      text: 'Sure! I\'ll be around Saturday afternoon. Text me when you\'re coming.',
      senderId: 'user4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 45),
      isRead: true,
      type: 'text',
    },
    {
      id: '5',
      text: 'The mini fridge works perfectly! Thanks again.',
      senderId: 'user4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      type: 'text',
    },
  ],
  '5': [
    {
      id: '1',
      text: 'Hi! I saw your coffee maker listing. Is it still available?',
      senderId: 'user5',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes! It\'s a great coffee maker, perfect for dorm life. Makes excellent coffee.',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Is the coffee maker still available?',
      senderId: 'user5',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: false,
      type: 'text',
    },
  ],
  '6': [
    {
      id: '1',
      text: 'Hi! I\'m interested in your bike. Is it still available?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      text: 'Yes! It\'s a great bike for getting around campus. Very reliable.',
      senderId: 'user6',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      text: 'Can I test ride it before buying?',
      senderId: 'current',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
      isRead: true,
      type: 'text',
    },
    {
      id: '4',
      text: 'Of course! I\'ll be at the campus center tomorrow at 2pm if you want to test it.',
      senderId: 'user6',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6.5),
      isRead: true,
      type: 'text',
    },
    {
      id: '5',
      text: 'The bike is in great condition. Thanks!',
      senderId: 'user6',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isRead: true,
      type: 'text',
    },
  ],
};

const MessagePage: React.FC = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [itemContext, setItemContext] = useState<Item | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processedListingRef = useRef<string | null>(null);

  // Handle Contact Seller navigation (from listing detail page)
  useEffect(() => {
    const state = location.state as { to?: string; listingId?: string; seller?: any; listing?: any } | null
    const searchParams = new URLSearchParams(location.search)
    const toUid = state?.to || searchParams.get('to')
    const listingId = state?.listingId || searchParams.get('listing')
    
    if (toUid && listingId && processedListingRef.current !== listingId) {
      dlog('[CONTACT_SELLER] navigate target', { to: toUid, listingId })
      // Try to fetch listing and start conversation
      // For now, we'll just log it - you can implement full conversation creation here
      processedListingRef.current = listingId
    }
  }, [location.state, location.search])

  // Get item context from navigation state
  const listingFromState = location.state?.listing as Item | null;

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle item context from navigation
  useEffect(() => {
    if (listingFromState && processedListingRef.current !== listingFromState.id) {
      setItemContext(listingFromState);
      processedListingRef.current = listingFromState.id;
      
      // Create or find conversation with the seller
      const sellerId = listingFromState.seller.id;
      const existingConversation = conversations.find(conv => conv.participant.id === sellerId);
      
      if (existingConversation) {
        setSelectedConversation(existingConversation.id);
      } else {
        // Create new conversation with seller
        const newConversation: Conversation = {
          id: `seller-${sellerId}`,
          participant: {
            id: sellerId,
            name: listingFromState.seller.name,
            avatar: listingFromState.seller.profilePicture || listingFromState.seller.profileImage || '/api/placeholder/40/40',
            isOnline: true,
          },
          lastMessage: {
            text: `Hi! I'm interested in your ${listingFromState.title}`,
            timestamp: new Date(),
            senderId: 'current',
            isRead: false,
          },
          unreadCount: 0,
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation.id);
        
        // Add initial message about the item
        const initialMessage: Message = {
          id: `item-${Date.now()}`,
          text: `Hi! I'm interested in your ${listingFromState.title}`,
          senderId: 'current',
          timestamp: new Date(),
          isRead: false,
          type: 'text',
        };
        
        setMessages([initialMessage]);
      }
    }
  }, [listingFromState, conversations]);

  // Set item context based on selected conversation
  useEffect(() => {
    if (selectedConversation && mockItems[selectedConversation]) {
      setItemContext(mockItems[selectedConversation]);
    } else if (!listingFromState) {
      setItemContext(null);
    }
  }, [selectedConversation, listingFromState]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation] || []);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validation = validateMessage(newMessage, files);
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setAttachments(files);
    setError(null);
  };

  // Handle file removal
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Simulate file upload
  const uploadFiles = async (files: File[]): Promise<{ id: string; name: string; url: string; type: 'image' | 'file'; size: number }[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const uploadedFiles = files.map(file => ({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
          size: file.size
        }));
        resolve(uploadedFiles);
      }, 1000);
    });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    // Validate message
    const validation = validateMessage(newMessage, attachments);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let uploadedAttachments: { id: string; name: string; url: string; type: 'image' | 'file'; size: number }[] = [];
      
      if (attachments.length > 0) {
        uploadedAttachments = await uploadFiles(attachments);
      }

      const message: Message = {
        id: Date.now().toString(),
        text: sanitizeMessage(newMessage.trim()),
        senderId: 'current',
        timestamp: new Date(),
        isRead: false,
        type: attachments.length > 0 ? 'image' : 'text',
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setAttachments([]);

      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? {
              ...conv,
              lastMessage: {
                text: message.text,
                timestamp: message.timestamp,
                senderId: message.senderId,
                isRead: message.isRead,
              }
            }
          : conv
      ));
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle key press for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Format last seen time
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `Last seen ${minutes}m ago`;
    if (hours < 24) return `Last seen ${hours}h ago`;
    return 'Last seen recently';
  };

  return (
    <div className="fixed inset-0 bg-transparent flex overflow-hidden" style={{ height: '100vh', maxHeight: '100vh', width: '100vw' }}>
      {/* Conversations Sidebar */}
      <div className={`dd-card bg-surface border-surface w-full sm:w-80 flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`} style={{ height: '100vh', maxHeight: '100vh' }}>
        {/* Header */}
        <div className="p-4 border-b border-surface flex items-center justify-between flex-shrink-0 bg-surface">
          <h1 className="text-xl font-semibold text-body">Messages</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-surface flex-shrink-0 bg-surface">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ height: 'calc(100vh - 140px)' }}>
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              whileHover={{ backgroundColor: '#f8fafc' }}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                selectedConversation === conversation.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
              }`}
              onClick={() => {
                setSelectedConversation(conversation.id);
                setShowMobileChat(true);
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.participant.avatar}
                    alt={conversation.participant.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  {conversation.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-base">
                      {conversation.participant.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      !conversation.lastMessage.isRead && conversation.lastMessage.senderId !== 'current'
                        ? 'font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}>
                      {conversation.isTyping ? (
                        <span className="text-primary-600 italic">Typing...</span>
                      ) : (
                        conversation.lastMessage.text
                      )}
                    </p>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-surface-2 ${showMobileChat ? 'flex' : 'hidden lg:flex'}`} style={{ height: '100vh', maxHeight: '100vh' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-surface border-b border-surface px-4 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <img
                    src={currentConversation?.participant.avatar}
                    alt={currentConversation?.participant.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  {currentConversation?.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {currentConversation?.participant.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentConversation?.participant.isOnline 
                      ? 'Active now' 
                      : currentConversation?.participant.lastSeen 
                        ? formatLastSeen(currentConversation.participant.lastSeen)
                        : 'Offline'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Item Context Display */}
            {itemContext && (
              <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
                {/* Seller Name */}
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">
                        {itemContext.seller.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Talking about:</span>
                    <span className="text-sm font-semibold text-gray-900">{itemContext.seller.name}&apos;s item</span>
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={itemContext.images[0] || '/api/placeholder/64/64'}
                      alt={itemContext.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{itemContext.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-primary-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{formatCurrency(itemContext.price)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{itemContext.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatRelativeTime(itemContext.posted)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                        {itemContext.condition}
                      </span>
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                        {itemContext.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setItemContext(null)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ height: 'calc(100vh - 200px)' }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.senderId === 'current' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.senderId === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="relative">
                            {attachment.type === 'image' ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(attachment.url, '_blank')}
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm truncate">{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {message.text && <p className="text-sm">{message.text}</p>}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0 shadow-lg">
              {/* Error Message */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Attachments ({attachments.length})</span>
                    <button
                      onClick={() => setAttachments([])}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
                        <button
                          onClick={() => handleRemoveAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach images"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white focus:shadow-sm transition-all duration-200"
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && attachments.length === 0) || uploading}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50" style={{ height: '100vh' }}>
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a conversation</h3>
              <p className="text-gray-500 text-lg">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
