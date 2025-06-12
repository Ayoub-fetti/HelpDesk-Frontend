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
      const response = await this.api.post(`${this.getBaseUrl()}/${notificationId}/read`)
      return response.data
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error)
      throw error
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.api.post(`${this.getBaseUrl()}/read-all`)
      return response.data
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  async getUnreadCount() {
    try {
      const response = await this.api.get(`${this.getBaseUrl()}/unread-count`)
      return response.data
    } catch (error) {
      console.error('Error fetching unread notification count:', error)
      throw error
    }
  }
}