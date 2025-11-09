import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { User, UserType } from '../types'
import { 
  getUserProfile, 
  createUserProfile
} from '../services/userService'
import toast from 'react-hot-toast'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Convert Firebase User and UserProfile to our User type
 */
function mapFirebaseUserToUser(firebaseUser: FirebaseUser, profile: any): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: profile?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    displayName: profile?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    userType: profile?.userType || UserType.REGULAR,
    school: profile?.school || 'University of Louisiana',
    major: profile?.major,
    phone: profile?.phone,
    profileImage: profile?.profileImage,
    joinDate: profile?.createdAt || new Date().toISOString(),
    joinedDate: profile?.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
    rating: profile?.rating || 0,
    reviewCount: profile?.reviewCount || 0,
    totalSales: profile?.totalSales || 0,
    isVerified: profile?.isVerified || false
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true)
        setError(null)

        if (firebaseUser) {
          // User is signed in, fetch their profile
          try {
            let profile = await getUserProfile(firebaseUser.uid)
            
            // If profile doesn't exist, create a default one
            if (!profile) {
              console.warn('User profile not found, creating default profile')
              profile = await createUserProfile(firebaseUser.uid, {
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                userType: UserType.REGULAR
              })
            }

            const mappedUser = mapFirebaseUserToUser(firebaseUser, profile)
            setUser(mappedUser)
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError)
            // Create a minimal user object if profile fetch fails
            const minimalUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              userType: UserType.REGULAR,
              school: 'University of Louisiana',
              joinDate: new Date().toISOString(),
              joinedDate: new Date().toISOString(),
              rating: 0,
              reviewCount: 0,
              totalSales: 0,
              isVerified: false
            }
            setUser(minimalUser)
            setError('Failed to load user profile. Some features may be limited.')
          }
        } else {
          // User is signed out
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError('Authentication error occurred')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Fetch user profile from Firestore
      try {
        let profile = await getUserProfile(firebaseUser.uid)
        
        // If profile doesn't exist, create a default one
        if (!profile) {
          console.warn('User profile not found during login, creating default profile')
          profile = await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            userType: UserType.REGULAR
          })
        }

        const mappedUser = mapFirebaseUserToUser(firebaseUser, profile)
        setUser(mappedUser)
        toast.success('Login successful!')
        return true
      } catch (profileError) {
        console.error('Error fetching user profile during login:', profileError)
        // Create minimal user object if profile fetch fails
        const minimalUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          userType: UserType.REGULAR,
          school: 'University of Louisiana',
          joinDate: new Date().toISOString(),
          joinedDate: new Date().toISOString(),
          rating: 0,
          reviewCount: 0,
          totalSales: 0,
          isVerified: false
        }
        setUser(minimalUser)
        toast.success('Login successful!')
        toast.error('Failed to load complete profile. Some features may be limited.')
        return true
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'No account found with this email'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later.'
        : 'Login failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, displayName: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Create user profile in Firestore with default userType 'regular'
      try {
        const profile = await createUserProfile(firebaseUser.uid, {
          email: email,
          displayName: displayName,
          userType: UserType.REGULAR // Default to regular user
        })

        const mappedUser = mapFirebaseUserToUser(firebaseUser, profile)
        setUser(mappedUser)
        toast.success('Account created successfully!')
        return true
      } catch (profileError: any) {
        console.error('Error creating user profile:', profileError)
        
        // If profile creation fails, sign out the user and show error
        await signOut(auth)
        const errorMessage = profileError.message || 'Failed to create user profile'
        setError(errorMessage)
        toast.error(errorMessage)
        return false
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/weak-password'
        ? 'Password is too weak. Please use at least 6 characters.'
        : 'Signup failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await signOut(auth)
      setUser(null)
      setError(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      setError('Failed to logout')
      toast.error('Failed to logout')
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    isLoading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
