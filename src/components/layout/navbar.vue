<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// Computed properties for auth state
const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)

// Handle logout
const handleLogout = async () => {
  await userStore.logout()
}
</script>

<template>
  <nav class="bg-blue-900 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
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