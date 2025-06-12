import BaseService from './BaseService'

export default class TicketService extends BaseService {
  constructor() {
    super('tickets')
  }

  async addComment(ticketId, content) {
    try {
      const response = await this.api.post(`${this.getBaseUrl()}/${ticketId}/comments`, { content })
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
      const response = await this.api.patch(
        `${this.getBaseUrl()}/${ticketId}/status`, 
        { status }
      )
      return response.data
    } catch (error) {
      console.error(`Error changing status for ticket ${ticketId}:`, error)
      throw error
    }
  }

  async assignTicket(ticketId, userId) {
    try {
      const response = await this.api.patch(
        `${this.getBaseUrl()}/${ticketId}/assign`, 
        { user_id: userId }
      )
      return response.data
    } catch (error) {
      console.error(`Error assigning ticket ${ticketId}:`, error)
      throw error
    }
  }
}