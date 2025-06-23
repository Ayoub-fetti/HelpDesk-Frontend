import api from '@/axios'

export default class AuthService {
  static async login(credentials) {
    try {
      // Get CSRF cookie first with absolute URL
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Add a small delay to ensure the cookie is properly set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Extract CSRF token from cookies
      const token = this.getCsrfToken()
      console.log('CSRF Token:', token)
      
      // Attempt login with explicit CSRF token in header
      const response = await api.post('/api/login', credentials, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Helper method to extract CSRF token from cookies
  static getCsrfToken() {
    const cookies = document.cookie.split(';')
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
    if (csrfCookie) {
      return decodeURIComponent(csrfCookie.split('=')[1])
    }
    return null
  }

  static async register(userData) {
    try {
      // Get CSRF cookie first
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Extract CSRF token from cookies
      const token = this.getCsrfToken()
      
      // Register user with explicit CSRF token
      const response = await api.post('/api/register', userData, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  static async logout() {
    try {
      // Get CSRF cookie first
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Extract CSRF token from cookies *after* the delay
      const token = this.getCsrfToken()
      
      const response = await api.post('/api/logout', {}, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  static async getCurrentUser() {
    try {
      const response = await api.get('/api/user', {
        headers: {
          'X-XSRF-TOKEN': this.getCsrfToken()
        }
      })
      return response.data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }
}