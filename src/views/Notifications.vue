<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/layout/navbar.vue'
import { useNotificationStore } from '@/stores'

const notificationStore = useNotificationStore()
const isLoading = ref(true)
const notificationsFilter = ref('all') // all, unread, read

// Load notifications on component mount
onMounted(async () => {
  try {
    isLoading.value = true
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  } finally {
    isLoading.value = false
  }
})

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  }).format(date)
}

// Mark a notification as read
const markAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as read:`, error)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

// Filtered notifications based on selected filter
const filteredNotifications = computed(() => {
  if (notificationsFilter.value === 'unread') {
    return notificationStore.notifications.filter(n => !n.read_at)
  } else if (notificationsFilter.value === 'read') {
    return notificationStore.notifications.filter(n => n.read_at)
  } else {
    return notificationStore.notifications
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar/>
    
    <div class="max-w-7xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-800">Notifications</h1>
          
          <div class="flex gap-4">
            <div class="relative inline-block">
              <select 
                v-model="notificationsFilter"
                class="bg-white border border-gray-300 px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les notifications</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
            
            <button 
              @click="markAllAsRead" 
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              :disabled="!notificationStore.unreadCount"
            >
              Tout marquer comme lu
            </button>
          </div>
        </div>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="py-10 flex justify-center">
          <p class="text-gray-500">Chargement des notifications...</p>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="!filteredNotifications.length" class="py-10 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">Aucune notification</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ notificationsFilter === 'unread' ? 'Vous n\'avez pas de notifications non lues.' : 'Vous n\'avez pas encore reçu de notifications.' }}
          </p>
        </div>
        
        <!-- Notifications list -->
        <div v-else class="space-y-2">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="['border border-gray-200 rounded-md p-4', {'bg-blue-50': !notification.read_at}]"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900">{{ notification.data?.title || 'Notification' }}</h3>
                <p class="mt-1 text-sm text-gray-600">{{ notification.data?.message }}</p>
              </div>
              
              <div class="flex flex-col items-end">
                <span class="text-xs text-gray-500">{{ formatDate(notification.created_at) }}</span>
                
                <button 
                  v-if="!notification.read_at"
                  @click="markAsRead(notification.id)" 
                  class="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Marquer comme lu
                </button>
                <span v-else class="mt-2 text-xs text-gray-500">Lu</span>
              </div>
            </div>
            
            <!-- Action links based on notification type -->
            <div v-if="notification.data?.actionUrl" class="mt-3 flex justify-end">
              <RouterLink 
                :to="notification.data.actionUrl" 
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ notification.data.actionText || 'Voir détails' }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>