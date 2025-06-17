import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService } from '@/services'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Get all notifications
  const fetchNotifications = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await notificationService.getNotifications()
      notifications.value = response.data || response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  // Get unread notification count
  const fetchUnreadCount = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await notificationService.getUnreadCount()
      console.log('Unread count response:', response)
      
      // Handle different response structures
      if (typeof response === 'number') {
        unreadCount.value = response
      } else if (response && response.count !== undefined) {
        unreadCount.value = response.count
      } else if (response && response.unread_count !== undefined) {
        unreadCount.value = response.unread_count
      } else {
        console.log('Could not parse unread count from response:', response)
        unreadCount.value = 0
      }
      
      console.log('Unread count value set to:', unreadCount.value)
    } catch (err) {
      error.value = 'Failed to fetch unread count'
      console.error('Error in fetchUnreadCount:', err)
      unreadCount.value = 0 // Set default value on error
    } finally {
      loading.value = false
    }
  }

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      loading.value = true
      error.value = null
      
      await notificationService.markAsRead(notificationId)
      
      // Update the notification in the list
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index].read_at = new Date().toISOString()
      }
      
      // Decrease unread count if needed
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark notification as read'
    } finally {
      loading.value = false
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      loading.value = true
      error.value = null
      
      await notificationService.markAllAsRead()
      
      // Update all notifications in the list
      const now = new Date().toISOString()
      notifications.value = notifications.value.map(notification => ({
        ...notification,
        read_at: notification.read_at || now
      }))
      
      // Reset unread count
      unreadCount.value = 0
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark all notifications as read'
    } finally {
      loading.value = false
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  }
})