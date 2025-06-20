import BaseService from './BaseService'

class AdminService extends BaseService {
  constructor() {
    super('/admin')
  }

  async getUsers(params) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/users`, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }
  async getUser(id) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  }
  async createUser(data) {
    try {
      const response = await this.api.post(`${this.getBaseUrl()}/users`, data)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }
  async updateUser(id, data) {
    try {
      const response = await this.api.put(`${this.getBaseUrl()}/users/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  }
   async deleteUser(id) {
    try {
      const response = await this.api.delete(`${this.getBaseUrl()}/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  }

  // Permissions
   async fetchPermissions() {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/permissions`)
      return response.data
    } catch (error) {
      console.error('Error fetching permissions:', error)
      throw error
    }
  }
  async assignRolePermissions(id, permissions) {
    try {
      const response = await this.api.post(`${this.getBaseUrl()}/users/${id}/roles-permissions`, { permissions })
      return response.data
    } catch (error) {
      console.error(`Error assigning permissions to role ${id}:`, error)
      throw error
    }
  }
}

export default AdminService