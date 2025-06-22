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
const isDeleting = ref(false)
const ticketToDelete = ref(null)
const showDeleteConfirm = ref(false)


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


// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Stats computed properties
const stats = computed(() => {
  const tickets = ticketStore.tickets
  return {
    total: tickets.length,
    open: tickets.filter(t => ['new'].includes(t.statut)).length,
    inProgress: tickets.filter(t => t.statut === 'in_progress').length,
    resolved: tickets.filter(t => t.statut === 'resolved').length,
    high: tickets.filter(t => t.priority === 'hight').length
  }
})

// Filtered tickets: only show tickets of the current user
const filteredTickets = computed(() => {
  let result = ticketStore.tickets.filter(
    ticket => ticket.user && ticket.user.id === userStore.user?.id
  )

  if (statutFilter.value !== 'all') {
    result = result.filter(ticket => ticket.statut === statutFilter.value)
  }

  if (priorityFilter.value !== 'all') {
    result = result.filter(ticket => ticket.priority === priorityFilter.value)
  }

  return result
})

// Handle filter changes
const updatestatutFilter = (statut) => {
  statutFilter.value = statut
}

const updatePriorityFilter = (priority) => {
  priorityFilter.value = priority
}

// Get statut badge classes
const getstatutBadgeClass = (statut) => {
  switch (statut) {
    case 'new': return 'bg-gray-100 text-gray-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'on_hold': return 'bg-green-100 text-green-700'
    case 'resolved': return 'bg-gray-200 text-gray-600'
    case 'closed': return 'bg-gray-200 text-gray-600'
    case 'reopen': return 'bg-gray-200 text-gray-600'
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

// Format statut label
const formatstatut = (statut) => {
  const statutLabels = {
    new: 'Nouveau',
    assigned: 'Attribué',
    in_progress: 'En cours',
    on_hold: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé',
    reopen: 'Rouvrir'
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

// Open delete confirmation modal
const confirmDelete = (ticket) => {
  ticketToDelete.value = ticket
  showDeleteConfirm.value = true
}

// Cancel deletion
const cancelDelete = () => {
  ticketToDelete.value = null
  showDeleteConfirm.value = false
}

// Delete ticket
const deleteTicket = async () => {
  if (!ticketToDelete.value) return
  
  try {
    isDeleting.value = true
    await ticketStore.deleteTicket(ticketToDelete.value.id)
    
    // Close modal and reset
    showDeleteConfirm.value = false
    ticketToDelete.value = null
  } catch (error) {
    console.error('Failed to delete ticket:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Navbar/>
  <div class="bg-gray-50 min-h-screen">
    <!-- Stats Section -->
    <div class="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Tableau de bord</h1>
      
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total tickets -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
            <i class="fas fa-clipboard-list text-blue-500 text-4xl"></i>
              <div class="ml-5">
                <p class="text-sm font-medium text-gray-500 truncate">Total des tickets</p>
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
                <p class="text-sm font-medium text-gray-500 truncate">Tickets ouverts</p>
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

      <!-- Create new ticket button -->
      <div class="mt-8 mb-4 flex justify-end">
        <RouterLink 
          to="/tickets/new" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouveau ticket
        </RouterLink>
      </div>
    </div>
    
    <!-- Ticket Table -->
    <div class="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Mes tickets</h2>
          <div class="flex gap-2">
            <div class="relative inline-block group">
              <button class="bg-gray-100 px-3 py-1 rounded text-sm">
                {{ statutFilter === 'all' ? 'Tous les statuts' : formatstatut(statutFilter) }}
                <span class="ml-1">▼</span>
              </button>
              <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                <div class="py-1">
                  <button @click="updatestatutFilter('all')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Tous les statuts</button>
                  <button @click="updatestatutFilter('new')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Nouveau</button>
                  <button @click="updatestatutFilter('in_progress')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">En cours</button>
                  <button @click="updatestatutFilter('on_hold')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">En Attent</button>
                  <button @click="updatestatutFilter('resolved')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Résolu</button>
                  <button @click="updatestatutFilter('assigned')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Attribué</button>
                  <button @click="updatestatutFilter('closed')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Fermé</button>
                  <button @click="updatestatutFilter('reopen')" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Rouvrir</button>
                </div>
              </div>
            </div>
            
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
          <p class="text-gray-500">Aucun ticket trouvé</p>
          <RouterLink to="/tickets/new" class="inline-block mt-3 text-blue-500 hover:underline">
            Créer un nouveau ticket
          </RouterLink>
        </div>

        <!-- Tickets table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full table-auto text-left text-sm">
            <thead>
              <tr class="text-gray-600 border-b">
                <th class="p-3">ID</th>
                <th class="p-3">Titre</th>
                <th class="p-3">Catégorie</th>
                <th class="p-3">Priorité</th>
                <th class="p-3">Statut</th>
                <th class="p-3">Date création</th>
                <th class="p-3">Technicien</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in filteredTickets" :key="ticket.id" class="border-b hover:bg-gray-50">
                <td class="p-3 text-blue-600 font-medium">#{{ ticket.id.toString().padStart(3, '0') }}</td>
                <td class="p-3">{{ ticket.title }}</td>
                <td class="p-3">{{ ticket.category.name }}</td>
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
                <td class="p-3">{{ formatDate(ticket.created_at) }}</td>
                <td class="p-3">{{ ticket.technician ? (ticket.technician.firstName + ' ' + ticket.technician.lastName) : '-' }}</td>                
                <td class="p-3 flex items-center gap-3 text-lg text-gray-600">
                  <RouterLink :to="`/ticket/${ticket.id}`" class="hover:text-blue-600" title="Voir">
                    <i class="fas fa-eye text-blue-500"></i>
                  </RouterLink>
                  <RouterLink :to="{name: 'update-ticket', query: { id: ticket.id }}" title="Modifier">
                    <i class="fas fa-edit text-orange-500"></i>
                  </RouterLink>
                  <button @click="confirmDelete(ticket)" class="hover:text-red-600" title="Supprimer">
                    <i class="fas fa-trash text-red-500"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
          <p class="text-sm text-gray-500">
            Êtes-vous sûr de vouloir supprimer le ticket 
            <span class="font-medium">{{ ticketToDelete?.title }}</span> ?
            Cette action est irréversible.
          </p>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="cancelDelete"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
            >
              Annuler
            </button>
            
            <button
              @click="deleteTicket"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isDeleting ? 'Suppression...' : 'Confirmer la suppression' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>