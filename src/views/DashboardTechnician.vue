<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketStore, useUserStore } from '@/stores'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/layout/navbar.vue'

const ticketStore = useTicketStore()
const userStore = useUserStore()
const isLoading = ref(true)
const statutFilter = ref('all')
const priorityFilter = ref('all')

// Get current technician
const currentUser = computed(() => userStore.user)

// Fetch tickets on component mount
onMounted(async () => {
  try {
    await ticketStore.fetchTickets()
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
  } finally {
    isLoading.value = false
  }
})

// Filter tickets assigned to current technician
const technicianTickets = computed(() => {
  return ticketStore.tickets.filter(ticket => {
    // Check if technician object exists and compare IDs
    if (ticket.technician) {
      return ticket.technician.id === currentUser.value?.id
    }
    return false
  })
})

// Filtered tickets with status and priority filters
const filteredTickets = computed(() => {
  let result = [...technicianTickets.value]
  
  if (statutFilter.value !== 'all') {
    result = result.filter(ticket => ticket.statut === statutFilter.value)
  }
  
  if (priorityFilter.value !== 'all') {
    result = result.filter(ticket => ticket.priority === priorityFilter.value)
  }
  
  return result
})

// Stats for technician's tickets
const stats = computed(() => {
  const tickets = technicianTickets.value
  return {
    total: tickets.length,
    open: tickets.filter(t => ['new', 'assigned'].includes(t.statut)).length,
    inProgress: tickets.filter(t => t.statut === 'in_progress').length,
    resolved: tickets.filter(t => t.statut === 'resolved').length
  }
})

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Handle filter changes
const updatestatutFilter = (statut) => {
  statutFilter.value = statut
}

const updatePriorityFilter = (priority) => {
  priorityFilter.value = priority
}

// Get status badge classes
const getstatutBadgeClass = (statut) => {
  switch (statut) {
    case 'new': return 'bg-gray-100 text-gray-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'on_hold': return 'bg-green-100 text-green-700'
    case 'resolved': return 'bg-gray-200 text-gray-600'
    case 'closed': return 'bg-gray-200 text-gray-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Get priority badge classes
const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-gray-200 text-gray-700'
    case 'average': return 'bg-blue-100 text-blue-600'
    case 'high': return 'bg-red-100 text-red-600'
    case 'urgent': return 'bg-pink-100 text-pink-600'
    default: return 'bg-gray-200 text-gray-700'
  }
}

// Format status label
const formatstatut = (statut) => {
  const statutLabels = {
    new: 'Nouveau',
    assigned: 'Attribué',
    in_progress: 'En cours',
    on_hold: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé'
  }
  return statutLabels[statut] || statut
}

// Format priority label
const formatPriority = (priority) => {
  const priorityLabels = {
    low: 'Basse',
    average: 'Normale',
    high: 'Haute',
    urgent: 'Critique'
  }
  return priorityLabels[priority] || priority
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <Navbar />
    
    <!-- Stats Section -->
    <div class="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Tableau de bord technicien</h1>
      
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total tickets -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <i class="fas fa-clipboard-list text-blue-500 text-4xl"></i>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500 truncate">Tickets assignés</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Open tickets -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <i class="fas fa-lock-open text-yellow-500 text-4xl"></i>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500 truncate">À traiter</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.open }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- In progress -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <i class="fas fa-spinner text-indigo-900 text-4xl"></i>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500 truncate">En cours</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.inProgress }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resolved -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <i class="fas fa-check-circle text-green-500 text-4xl"></i>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500 truncate">Résolu</p>
                <p class="mt-1 text-3xl font-semibold text-gray-900">{{ stats.resolved }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="mt-8">
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Mes tickets assignés</h2>
            <div class="flex gap-2">
              <!-- Status filter -->
              <div class="relative inline-block group">
                <button class="bg-gray-100 px-3 py-1 rounded text-sm">
                  {{ statutFilter === 'all' ? 'Tous les statuts' : formatstatut(statutFilter) }}
                  <span class="ml-1">▼</span>
                </button>
                <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div class="py-1">
                    <button @click="updatestatutFilter('all')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Tous les statuts</button>
                    <button @click="updatestatutFilter('assigned')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Attribué</button>
                    <button @click="updatestatutFilter('in_progress')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">En cours</button>
                    <button @click="updatestatutFilter('on_hold')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">En attente</button>
                    <button @click="updatestatutFilter('resolved')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Résolu</button>
                  </div>
                </div>
              </div>
              
              <!-- Priority filter -->
              <div class="relative inline-block group">
                <button class="bg-gray-100 px-3 py-1 rounded text-sm">
                  {{ priorityFilter === 'all' ? 'Toutes priorités' : formatPriority(priorityFilter) }}
                  <span class="ml-1">▼</span>
                </button>
                <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div class="py-1">
                    <button @click="updatePriorityFilter('all')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Toutes priorités</button>
                    <button @click="updatePriorityFilter('low')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Basse</button>
                    <button @click="updatePriorityFilter('average')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Normale</button>
                    <button @click="updatePriorityFilter('high')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Haute</button>
                    <button @click="updatePriorityFilter('urgent')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Critique</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="py-10 flex justify-center">
            <p class="text-gray-500">Chargement des tickets...</p>
          </div>

          <!-- No tickets state -->
          <div v-else-if="filteredTickets.length === 0" class="py-10 text-center">
            <p class="text-gray-500">Aucun ticket assigné trouvé</p>
          </div>

          <!-- Tickets table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead>
                <tr class="text-left text-gray-500 text-sm border-b">
                  <th class="p-3">ID</th>
                  <th class="p-3">Titre</th>
                  <th class="p-3">Catégorie</th>
                  <th class="p-3">Priorité</th>
                  <th class="p-3">Statut</th>
                  <th class="p-3">Client</th>
                  <th class="p-3">Date création</th>
                  <th class="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in filteredTickets" :key="ticket.id" class="border-b hover:bg-gray-50">
                  <td class="p-3 text-blue-600 font-medium">#{{ ticket.id.toString().padStart(3, '0') }}</td>
                  <td class="p-3">{{ ticket.title }}</td>
                  <td class="p-3">{{ ticket.category?.name }}</td>
                  <td class="p-3">
                    <span :class="[getPriorityBadgeClass(ticket.priority), 'px-2 py-1 rounded-full text-xs']">
                      {{ formatPriority(ticket.priority) }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span :class="[getstatutBadgeClass(ticket.statut), 'px-2 py-1 rounded-full text-xs']">
                      {{ formatstatut(ticket.statut) }}
                    </span>
                  </td>
                  <td class="p-3">{{ ticket.user?.firstName }} {{ ticket.user?.lastName }}</td>
                  <td class="p-3">{{ formatDate(ticket.created_at) }}</td>
                  <td class="p-3">
                    <RouterLink :to="`/ticket/${ticket.id}`" class="text-blue-600 hover:text-blue-800">
                      <i class="fas fa-eye ml-4"></i>
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>