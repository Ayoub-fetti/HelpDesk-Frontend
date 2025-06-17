import BaseService from './BaseService'
import AuthService from './AuthService'

export default class TicketService extends BaseService {
  constructor() {
    super('tickets')
  }

  async addComment(ticketId, commentData) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.post(`${this.getBaseUrl()}/${ticketId}/comments`, commentData, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error(`Error adding comment to ticket ${ticketId}:`, error)
      throw error
    }
  }

  async getComments(ticketId) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/${ticketId}/comments`)
      return response.data
    } catch (error) {
      console.error(`Error fetching comments for ticket ${ticketId}:`, error)
      throw error
    }
  }

  async changeStatus(ticketId, status) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.patch(
        `${this.getBaseUrl()}/${ticketId}/status`, 
        { status },
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error changing status for ticket ${ticketId}:`, error)
      throw error
    }
  }

  async assignTicket(ticketId, userId) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.patch(
        `${this.getBaseUrl()}/${ticketId}/assign`, 
        { user_id: userId },
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error assigning ticket ${ticketId}:`, error)
      throw error
    }
  }

  // Time tracking methods
  async getTimeTracking(ticketId) {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/${ticketId}/tracking`)
      return response.data
    } catch (error) {
      console.error(`Error fetching time tracking for ticket ${ticketId}:`, error)
      throw error
    }
  }

  async startTimeTracking(ticketId) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.post(
        `${this.getBaseUrl()}/${ticketId}/tracking-time/start`,
        {},
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error starting time tracking for ticket ${ticketId}:`, error)
      throw error
    }
  }

  async stopTimeTracking(ticketId) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.post(
        `${this.getBaseUrl()}/${ticketId}/tracking-time/stop`,
        {},
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error stopping time tracking for ticket ${ticketId}:`, error)
      throw error
    }
  }
}