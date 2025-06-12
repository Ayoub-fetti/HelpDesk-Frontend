import api from '@/axios'

export default class AuthService {
  static async login(credentials) {
    try {
      // Get CSRF cookie first
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      // Attempt login
      const response = await api.post('http://localhost:8000/api/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  static async register(userData) {
    try {
      // Get CSRF cookie first
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      // Register user
      const response = await api.post('http://localhost:8000/api/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  static async logout() {
    try {
      const response = await api.post('http://localhost:8000/api/logout')
      return response.data
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  static async getCurrentUser() {
    try {
      const response = await api.get('http://localhost:8000/api/user')
      return response.data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  }
}