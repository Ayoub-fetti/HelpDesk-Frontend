<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore, useNotificationStore } from '@/stores'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)

const showNotifications = ref(false)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const notificationTimer = ref(null)
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value && isAuthenticated.value) {
    await notificationStore.fetchNotifications()
  }
}

const markAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    console.error(`Failed to mark notification ${notificationId} as read:`, error)
  }
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
  }
}

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

const closeNotifications = (event) => {
  if (showNotifications.value && !event.target.closest('.notifications-container')) {
    showNotifications.value = false
  }
}

const initializeNotifications = async () => {
  if (isAuthenticated.value) {
    try {
      await notificationStore.fetchUnreadCount()
      notificationTimer.value = setInterval(async () => {
        if (isAuthenticated.value) {
          await notificationStore.fetchUnreadCount()
        }
      }, 30000)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }
}

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      await response.json()
    } catch (err) {
      console.error('Error testing notification endpoint:', err)
    }
  }

  setTimeout(async () => {
    await initializeNotifications()
  }, 500)

  document.addEventListener('click', closeNotifications)
})

onUnmounted(() => {
  document.removeEventListener('click', closeNotifications)
  if (notificationTimer.value) {
    clearInterval(notificationTimer.value)
  }
})

const handleLogout = async () => {
  await userStore.logout()
}

const previewNotifications = computed(() => {
  return notifications.value.slice(0, 5)
})
</script>

<template>
  <nav class="bg-blue-900 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <RouterLink to="/" class="flex-shrink-0 flex items-center hover:text-amber-100">
            <h1 class="text-2xl font-bold">HelpDesk<span class="text-blue-300">.</span></h1>
          </RouterLink>

          <!-- Desktop navigation -->
          <div class="hidden lg:flex ml-10 space-x-4 items-center">
            <RouterLink v-if="currentUser?.user_type === 'final_user'" to="/" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Accueil</RouterLink>
            <RouterLink v-if="currentUser?.user_type === 'final_user'" to="/contact" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Support</RouterLink>
            <RouterLink v-if="isAuthenticated && currentUser?.user_type === 'final_user'" to="/dashboard" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Tableau de bord</RouterLink>
            <RouterLink v-if="isAuthenticated && currentUser?.user_type === 'final_user'" to="/tickets/new" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Nouveau Ticket</RouterLink>
            <RouterLink v-if="isAdmin" to="/admin" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Administrator</RouterLink>
            <RouterLink v-if="currentUser?.user_type === 'technician'" to="/dashboard/technician" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Technicien</RouterLink>
            <RouterLink v-if="currentUser?.user_type === 'supervisor'" to="/dashboard/supervisor" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800" active-class="bg-blue-800">Superviseur</RouterLink>
          </div>
        </div>

        <div class="flex justify-end gap-5">
                  <!-- Notifications - Always visible -->
                <div v-if="isAuthenticated" class="relative notifications-container">
                  <button @click.stop="toggleNotifications" class="flex items-center relative mt-1.5">
                    <i class="fas fa-bell text-xl cursor-pointer"></i>
                    <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {{ unreadCount > 99 ? '99+' : unreadCount }}
                    </span>
                  </button>

                  <!-- Notifications Panel -->
                  <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-30">
                    <div class="py-2 bg-blue-700 text-white px-4 flex justify-between items-center">
                      <h3 class="text-sm font-medium">Notifications</h3>
                      <button @click.stop="markAllAsRead" class="text-xs hover:underline focus:outline-none" :disabled="unreadCount === 0">
                        Tout marquer comme lu
                      </button>
                    </div>

                    <div class="max-h-96 overflow-y-auto">
                      <div v-if="notificationStore.loading" class="p-4 text-center text-gray-500 text-sm">
                        <i class="fas fa-circle-notch fa-spin mr-2"></i> Chargement des notifications...
                      </div>
                      <div v-else-if="!notifications.length" class="p-4 text-center text-gray-500 text-sm">
                        <i class="fas fa-bell-slash mr-1"></i> Pas de notifications
                      </div>
                      <div v-else>
                        <div v-for="notification in previewNotifications" :key="notification.id" :class="['p-3 border-b text-sm cursor-pointer hover:bg-gray-50', { 'bg-blue-50': !notification.read_at }]" @click.stop="markAsRead(notification.id)">
                          <div class="flex justify-between">
                            <p class="font-semibold text-gray-800">{{ notification.data?.title || 'Notification' }}</p>
                            <span class="text-xs text-gray-400">{{ formatDate(notification.created_at) }}</span>
                          </div>
                          <p class="text-gray-600 mt-1">{{ notification.data?.message }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-if="notifications.length" class="py-2 bg-gray-50 text-center">
                      <RouterLink to="/notifications" class="text-xs text-blue-600 hover:underline">Voir toutes les notifications</RouterLink>
                    </div>
                  </div>
                </div>

                <!-- Burger menu button -->
                <div class="lg:hidden ml-2">
                  <button @click="toggleMenu" class="text-white text-2xl focus:outline-none">
                    <i class="fas fa-bars"></i>
                  </button>
                </div>
        </div>

        <!-- Right side -->
        <div class="hidden lg:flex items-center">
          <div v-if="isAuthenticated" class="ml-4 flex items-center md:ml-6">
            <!-- User -->
            <div class="hidden ml-3 relative group">
              <div class="flex items-center">
                <span class="mr-2">
                  {{ currentUser?.firstName?.charAt(0).toUpperCase() + currentUser?.firstName?.slice(1) }}
                  {{ currentUser?.lastName?.charAt(0).toUpperCase() + currentUser?.lastName?.slice(1) }}
                </span>
                <button @click="handleLogout" class="px-3 py-2 bg-blue-800 hover:bg-blue-700 rounded-md text-sm font-medium">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          <div v-else class="ml-4 flex items-center space-x-3">
            <RouterLink to="/login" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800">Se connecter</RouterLink>
            <RouterLink to="/register" class="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-sm font-medium">S'inscrire</RouterLink>
          </div>
        </div>
      </div>

      <!-- Mobile Menu (sliding) -->
      <div class="lg:hidden transition-all duration-300 ease-in-out overflow-hidden" :class="isMenuOpen ? 'max-h-screen opacity-100 py-4 space-y-2' : 'max-h-0 opacity-0'">
        <!-- Auth: user info or login/register -->
        <div v-if="isAuthenticated" class="flex flex-col space-y-2">
          <span class="text-sm text-white">Bonjour, <strong>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</strong></span>
          <button @click="handleLogout" class="w-full px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-medium rounded-md"><i class="fa-solid fa-right-from-bracket mr-2"></i>Déconnexion</button>
        </div>
        <div v-else class="flex flex-col space-y-2">
          <RouterLink to="/login" class="w-full px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-md text-sm text-white text-center">Se connecter</RouterLink>
          <RouterLink to="/register" class="w-full px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-md text-sm text-white text-center">S'inscrire</RouterLink>
        </div>
        <RouterLink v-if="currentUser?.user_type === 'final_user'" to="/" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Accueil</RouterLink>
        <RouterLink v-if="isAuthenticated && currentUser?.user_type === 'final_user'" to="/dashboard" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Tableau de bord</RouterLink>
        <RouterLink v-if="isAuthenticated && currentUser?.user_type === 'final_user'" to="/tickets/new" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Nouveau Ticket</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Administrator</RouterLink>
        <RouterLink v-if="currentUser?.user_type === 'technician'" to="/dashboard/technician" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Technicien</RouterLink>
        <RouterLink v-if="currentUser?.user_type === 'supervisor'" to="/dashboard/supervisor" class="block px-3 py-2 rounded-md text-sm font-medium bg-blue-800" @click="isMenuOpen = false">Superviseur</RouterLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.notifications-container {
  position: relative;
}
</style>
