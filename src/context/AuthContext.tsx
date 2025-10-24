import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('dormdeals_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // For now, we'll simulate a login without actual validation
      // In a real app, this would make an API call to validate credentials
      const mockUser: User = {
        id: '1',
        email: email,
        name: email.split('@')[0], // Use email prefix as name
        school: 'University',
        joinDate: new Date().toISOString(),
        joinedDate: new Date().toISOString(),
        rating: 5.0,
        reviewCount: 0,
        totalSales: 0,
        isVerified: true
      }

      setUser(mockUser)
      localStorage.setItem('dormdeals_user', JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dormdeals_user')
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
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
