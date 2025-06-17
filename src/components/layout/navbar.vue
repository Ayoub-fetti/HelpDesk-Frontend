<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore, useNotificationStore } from '@/stores'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

// Computed properties for auth state
const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)

// Notification state
const showNotifications = ref(false)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

// Timer reference for periodic updates
const notificationTimer = ref(null)

// Toggle notification panel
const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  
  // Fetch notifications when opening the panel
  if (showNotifications.value && isAuthenticated.value) {
    await notificationStore.fetchNotifications()
  }
}

// Mark a notification as read
const markAsRead = async (notificationId) => {
  try {
    console.log(`Marking notification ${notificationId} as read...`)
    await notificationStore.markAsRead(notificationId)
    console.log(`Notification ${notificationId} marked as read successfully`)
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as read:`, error)
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    console.log('Marking all notifications as read...')
    await notificationStore.markAllAsRead()
    console.log('All notifications marked as read successfully')
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

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

// Close notifications panel when clicking outside
const closeNotifications = (event) => {
  if (showNotifications.value && !event.target.closest('.notifications-container')) {
    showNotifications.value = false
  }
}

// Fetch notification count on component mount and periodically refresh
const initializeNotifications = async () => {
  if (isAuthenticated.value) {
    try {
      console.log('Fetching unread notification count...')
      // Initial fetch
      await notificationStore.fetchUnreadCount()
      console.log('Initial unread count:', unreadCount.value)
      
      // For debugging, log the raw notifications state
      console.log('Notification store state:', {
        unreadCount: notificationStore.unreadCount,
        error: notificationStore.error,
        loading: notificationStore.loading
      });
      
      // Set up periodic refresh of unread count (every 30 seconds)
      notificationTimer.value = setInterval(async () => {
        if (isAuthenticated.value) {
          await notificationStore.fetchUnreadCount()
          console.log('Refreshed unread count:', unreadCount.value)
        }
      }, 30000)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }
}

// Load notifications count on component mount
onMounted(async () => {
  // For debugging purposes, make a direct API call to check the endpoint response
  if (isAuthenticated.value) {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log('Raw API response for unread count:', data);
    } catch (err) {
      console.error('Error testing notification endpoint:', err);
    }
  }

  // Short timeout to ensure auth state is updated
  setTimeout(async () => {
    // Initialize notifications
    await initializeNotifications()
  }, 500)

  // Register click outside listener
  document.addEventListener('click', closeNotifications)
})

// Clean up on component unmount
onUnmounted(() => {
  document.removeEventListener('click', closeNotifications)
  
  // Clear the interval to prevent memory leaks
  if (notificationTimer.value) {
    clearInterval(notificationTimer.value)
  }
})

// Handle logout
const handleLogout = async () => {
  await userStore.logout()
}

const previewNotifications = computed(() => {
  return notifications.value.slice(0,5);
})
</script>

<template>
  <nav class="bg-blue-900 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center hover:text-amber-100">
          <RouterLink to="/" class="flex-shrink-0 flex items-center">
            <h1 class="text-2xl font-bold">HelpDesk<span class="text-blue-300">.</span></h1>
          </RouterLink>
          
          <!-- Navigation Links -->
          <div class="ml-10 flex items-baseline space-x-4">
            <RouterLink 
              to="/" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
              active-class="bg-blue-800"
            >
              Accueil 
            </RouterLink>
            <RouterLink 
              to="/contact" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
              active-class="bg-blue-800"
            >
              Contactez-nous 
            </RouterLink>
            
            <RouterLink 
              v-if="isAuthenticated" 
              to="/dashboard" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
              active-class="bg-blue-800"
            >
              Tableau de bord
            </RouterLink>
            
            <RouterLink 
              v-if="isAuthenticated" 
              to="/tickets/new" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
              active-class="bg-blue-800"
            >
              Nouveau Ticket
            </RouterLink>
            
            <RouterLink 
              v-if="isAdmin" 
              to="/admin" 
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
              active-class="bg-blue-800"
            >
              Admin
            </RouterLink>
          </div>
        </div>
        
        <!-- Right side menu -->
        <div class="flex items-center">
          <div v-if="isAuthenticated" class="ml-4 flex items-center md:ml-6">
            <!-- Notification Bell -->
            <div class="relative notifications-container">
              <button @click.stop="toggleNotifications" class="mr-4 flex items-center relative">
                <i class="fas fa-bell text-xl cursor-pointer"></i>
                <!-- Debug info to check if the count is available -->
                <span 
                  v-if="unreadCount > 0" 
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {{ unreadCount > 99 ? '99+' : unreadCount }}
                </span>
                <!-- Debugging element to check the raw count value -->
                <!-- <span class="sr-only">{{ unreadCount }}</span> -->
              </button>
              
              <!-- Notifications Panel -->
              <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <div class="py-2 bg-blue-700 text-white px-4 flex justify-between items-center">
                  <h3 class="text-sm font-medium">Notifications</h3>
                  <button 
                    @click.stop="markAllAsRead" 
                    class="text-xs hover:underline focus:outline-none"
                    :disabled="unreadCount === 0"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
                
                <div class="max-h-96 overflow-y-auto">
                  <!-- Loading state -->
                  <div v-if="notificationStore.loading" class="p-4 text-center text-gray-500 text-sm">
                    <i class="fas fa-circle-notch fa-spin mr-2"></i>
                    Chargement des notifications...
                  </div>
                  
                  <!-- Empty state -->
                  <div v-else-if="!notifications.length" class="p-4 text-center text-gray-500 text-sm">
                    <i class="fas fa-bell-slash mr-1"></i>
                    Pas de notifications
                  </div>
                  
                  <!-- Notification list -->
                  <div v-else>
                    <div 
                      v-for="notification in previewNotifications" 
                      :key="notification.id" 
                      :class="[
                        'p-3 border-b border-gray-100 text-sm cursor-pointer hover:bg-gray-50', 
                        {'bg-blue-50': !notification.read_at}
                      ]"
                      @click.stop="markAsRead(notification.id)"
                    >
                      <div class="flex justify-between">
                        <p class="font-semibold text-gray-800">{{ notification.data?.title || 'Notification' }}</p>
                        <span class="text-xs text-gray-400">{{ formatDate(notification.created_at) }}</span>
                      </div>
                      <p class="text-gray-600 mt-1">{{ notification.data?.message }}</p>
                    </div>
                  </div>
                </div>
                
                <div v-if="notifications.length" class="py-2 bg-gray-50 text-center">
                  <RouterLink to="/notifications" class="text-xs text-blue-600 hover:underline">
                    Voir toutes les notifications
                  </RouterLink>
                </div>
              </div>
            </div>
            
            <!-- User info -->
            <div class="ml-3 relative group">
              <div class="flex items-center">
                <span class="mr-2">
                  {{ currentUser?.firstName?.charAt(0).toUpperCase() + currentUser?.firstName?.slice(1) }}
                  {{ currentUser?.lastName?.charAt(0).toUpperCase() + currentUser?.lastName?.slice(1) }}
                </span>
                <button
                  @click="handleLogout"
                  class="px-3 py-2 bg-blue-800 hover:bg-blue-700 rounded-md text-sm font-medium"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="ml-4 flex items-center space-x-3">
            <RouterLink
              to="/login"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
            >
              Se connecter
            </RouterLink>
            <RouterLink
              to="/register"
              class="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-sm font-medium"
            >
              S'inscrire
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.notifications-container {
  position: relative;
}
</style>