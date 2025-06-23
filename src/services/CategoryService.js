import BaseService from './BaseService'
import { AuthService } from '@/services'
import api from '@/axios'

class CategoryService extends BaseService {
  constructor() {
    super('categories')
  }

  
  async getCategories(params) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }
  async getCategory(id) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error)
      throw error
    }
  }
  async createCategory(data) {
    try {
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      const token = AuthService.getCsrfToken()
      const response = await this.api.post(
        `${this.getBaseUrl()}/`,
         data , {
            headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          }, 
         })
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }
  async updateCategory(id, data) {
    try {
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      const token = AuthService.getCsrfToken()
      const response = await this.api.put(
        `${this.getBaseUrl()}/${id}`,
         data, {
            headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          }
         })
      return response.data
    } catch (error) {
      console.error(`Error updating category ${id}:`, error)
      throw error
    }
  }
  async deleteCategory(id) {
    try {
      await api.get('http://localhost:8000/sanctum/csrf-cookie')
      const token = AuthService.getCsrfToken()
      const response = await this.api.delete(
        `${this.getBaseUrl()}/${id}`, {
          headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          } 
        })
      return response.data
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error)
      throw error
    }
  }
}

export default CategoryService