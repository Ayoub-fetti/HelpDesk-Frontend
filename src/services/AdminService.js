import BaseService from './BaseService'
import {AuthService} from '@/services'

class AdminService extends BaseService {
  constructor() {
    super('admin')
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
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      // Get CSRF token
      const token = AuthService.getCsrfToken()

      const response = await this.api.post(
        `${this.getBaseUrl()}/users`,
         data, {
            headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          }
         })
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }
  async updateUser(id, data) {
    try {
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      // Get CSRF token
      const token = AuthService.getCsrfToken()

      const response = await this.api.put(
        `${this.getBaseUrl()}/users/${id}`, 
        data, {
          headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      throw error
    }
  }
  async deleteUser(id) {
    try {
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      const token = AuthService.getCsrfToken()
      const response = await this.api.delete(
        `${this.getBaseUrl()}/users/${id}`,
        {
          headers: {
            'X-XSRF-TOKEN': token,
            'Content-Type': 'application/json'
          }
        }
      )
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
async assignRolePermissions(id, { roles, permissions }) {
  try {
    await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
    const token = AuthService.getCsrfToken()
    const response = await this.api.post(
      `${this.getBaseUrl()}/users/${id}/roles-permissions`,
      { roles, permissions },
      {
        headers: {
          'X-XSRF-TOKEN': token,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error assigning permissions to role ${id}:`, error)
    throw error
  }
}
}

export default AdminService