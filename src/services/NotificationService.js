import BaseService from './BaseService'

export default class NotificationService extends BaseService {
  constructor() {
    super('notifications')
  }

  async getNotifications() {
    try {
      const response = await this.api.get(this.getBaseUrl())
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  async markAsRead(notificationId) {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = this.getCsrfToken()
      
      const response = await this.api.post(`${this.getBaseUrl()}/${notificationId}/read`, {}, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      throw error
    }
  }

  async markAllAsRead() {
    try {
      // Get CSRF cookie first
      await this.api.get('http://localhost:8000/sanctum/csrf-cookie')
      
      // Get CSRF token
      const token = this.getCsrfToken()
      
      const response = await this.api.post(`${this.getBaseUrl()}/read-all`, {}, {
        headers: {
          'X-XSRF-TOKEN': token
        }
      })
      return response.data
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

async getUnreadCount() {
  try {
    const response = await this.api.get(`${this.getBaseUrl()}/unread-count`)
    
    // Handle the backend response format (unread_count instead of count)
    if (typeof response.data === 'number') {
      return { count: response.data }
    } else if (response.data.unread_count !== undefined) {
      return { count: response.data.unread_count }
    } else if (response.data.count !== undefined) {
      return response.data
    } else {
      console.log('Unexpected unread count response format:', response.data)
      return { count: 0 }
    }
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    return { count: 0 } // Return default object on error
  }
}
  
  // Helper method to extract CSRF token from cookies
  getCsrfToken() {
    const cookies = document.cookie.split(';')
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
    if (csrfCookie) {
      return decodeURIComponent(csrfCookie.split('=')[1])
    }
    return null
  }
}