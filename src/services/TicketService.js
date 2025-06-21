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

async changeStatus(ticketId, statut) {
  try {
    // Get CSRF cookie first
    await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
    
    // Get CSRF token
    const token = AuthService.getCsrfToken()
    
    const response = await this.api.post(
      `${this.getBaseUrl()}/${ticketId}/status`,
      { statut: statut }, 
      {
        headers: {
          'X-XSRF-TOKEN': token,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error changing status for ticket ${ticketId}:`, error)
    throw error
  }
}

async assignTicket(ticketId, technicianId) {
  try {
    // Get CSRF cookie first
    await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
    
    // Get CSRF token
    const token = AuthService.getCsrfToken()
    
    // Only send technician_id
    const response = await this.api.post(
      `${this.getBaseUrl()}/${ticketId}/assign`, 
      { technician_id: technicianId },
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

async removeAssignment(ticketId) {
  try {
    // Get CSRF cookie first
    await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
    
    // Get CSRF token
    const token = AuthService.getCsrfToken()
    
    const response = await this.api.post(
      `${this.getBaseUrl()}/${ticketId}/unassign`,
      {},
      {
        headers: {
          'X-XSRF-TOKEN': token
        }
      }
    )
    return response.data
  } catch (error) {
    console.error(`Error removing assignment for ticket ${ticketId}:`, error)
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

  async closeTicket(ticketId) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token  
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.post(
        `${this.getBaseUrl()}/${ticketId}/close`,
        {},
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error closing ticket ${ticketId}:`, error)
      throw error
    }
  }

  async resolveTicket(ticketId, data) {
    try {
      // Get CSRF cookie first  
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = AuthService.getCsrfToken()
      
      const response = await this.api.post(
        `${this.getBaseUrl()}/${ticketId}/resolve`,
        data,
        {
          headers: {
            'X-XSRF-TOKEN': token
          }
        }
      )
      return response.data
    } catch (error) {
      console.error(`Error resolving ticket ${ticketId}:`, error) 
      throw error
    }
  }
  
  async uploadAttachments(id, formData) {
    try {
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      const token = AuthService.getCsrfToken()

      const config = {
        headers: {
          'X-XSRF-TOKEN': token,
          'Content-Type': 'multipart/form-data'
        }
      }

      const response = await this.api.post(`${this.getBaseUrl()}/${id}/attachments`, formData, config)
      return response.data
    } catch (error) {
      console.error(`Error uploading attachments for ticket ${id}:`, error)
      throw error
    }
  }
}