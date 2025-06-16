import api from '@/axios'
import AuthService from './AuthService'

export default class BaseService {
  constructor(resource) {
    this.resource = resource
    this.api = api
  }

  getBaseUrl() {
    return `http://localhost:8000/api/${this.resource}`
  }

  async getAll(params = {}) {
    try {
      const response = await this.api.get(this.getBaseUrl(), { params })
      return response.data
    } catch (error) {
      console.error(`Error fetching ${this.resource}:`, error)
      throw error
    }
  }

  async getOne(id) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${this.resource}/${id}:`, error)
      throw error
    }
  }

async create(data) {
  try {
    // Get CSRF cookie first
    await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
    
    // Add a small delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Get CSRF token using AuthService method
    const token = AuthService.getCsrfToken()
    
    const config = {
      headers: {
        'X-XSRF-TOKEN': token,
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    }
    
    const response = await this.api.post(this.getBaseUrl(), data, config)
    return response.data
  } catch (error) {
    console.error(`Error creating ${this.resource}:`, error)
    throw error
  }
}

  async update(id, data) {
    try {
      const response = await this.api.put(`${this.getBaseUrl()}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating ${this.resource}/${id}:`, error)
      throw error
    }
  }

  async delete(id) {
    try {
      // Get CSRF cookie first
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get CSRF token using AuthService method
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.delete(`${this.getBaseUrl()}/${id}`, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error(`Error deleting ${this.resource}/${id}:`, error)
      throw error
    }
  }
}