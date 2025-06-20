import BaseService from './BaseService'

class CategoryService extends BaseService {
  constructor() {
    super('/categories')
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
      const response = await this.api.post(`${this.getBaseUrl()}/`, data)
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }
  async updateCategory(id, data) {
    try {
      const response = await this.api.put(`${this.getBaseUrl()}/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating category ${id}:`, error)
      throw error
    }
  }
  async deleteCategory(id) {
    try {
      const response = await this.api.delete(`${this.getBaseUrl()}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error)
      throw error
    }
  }
}

export default CategoryService