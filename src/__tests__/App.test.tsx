import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the ShopContext provider
const MockApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

describe('App', () => {
  it('renders without crashing', () => {
    render(<MockApp />)
    // Basic test to ensure the app renders
    expect(document.body).toBeDefined()
  })

  it('has the correct document title', () => {
    render(<MockApp />)
    expect(document.title).toBe('DormDeals')
  })
})
