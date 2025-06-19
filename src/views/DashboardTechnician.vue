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
const changeTicketStatus = async (ticketId, newStatus) => {
  try {
    isProcessing.value = true
    await ticketStore.changeStatus(ticketId, newStatus)
    showStatusModal.value = false
  } catch (error) {
    console.error('Failed to change ticket status:', error)
  } finally {
    isProcessing.value = false
  }
}
const closeTicket = async (ticketId) => {
  try {
    await ticketStore.closeTicket(ticketId)
    await ticketStore.fetchTickets()
  } catch (error) {
    console.error('Failed to close ticket:', error)
  }
}
const resolveTicket = async (ticketId) => {
  try {
    await ticketStore.resolveTicket(ticketId)
    await ticketStore.fetchTickets()
  } catch (error) {
    console.error('Failed to resolve ticket:', error)
  }
}

// Add these refs and methods in the script section:
const showStatusModal = ref(false)
const showResolveModal = ref(false)
const selectedTicketId = ref(null)
const solution = ref('')
const isProcessing = ref(false)

// Add these methods:
const openStatusModal = (ticketId) => {
  selectedTicketId.value = ticketId
  showStatusModal.value = true
}

const openResolveModal = (ticketId) => {
  selectedTicketId.value = ticketId
  solution.value = ''
  showResolveModal.value = true
}

const handleStatusChange = async (newStatus) => {
  if (!selectedTicketId.value) return
  await changeTicketStatus(selectedTicketId.value, newStatus)
}

const handleResolveTicket = async () => {
  if (!solution.value.trim()) {
    return
  }
  
  try {
    isProcessing.value = true
    await ticketStore.resolveTicket(selectedTicketId.value, {
      solution: solution.value
    })
    await ticketStore.fetchTickets()
    showResolveModal.value = false
  } catch (error) {
    console.error('Failed to resolve ticket:', error)
  } finally {
    isProcessing.value = false
  }
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
                    <div class="flex items-center gap-3">
                      <!-- View ticket -->
                      <RouterLink 
                        :to="`/ticket/${ticket.id}`" 
                        class="text-blue-600 hover:text-blue-800"
                        title="Voir le ticket">
                        <i class="fas fa-eye"></i>
                      </RouterLink>

                      <!-- Change Status -->
                      <button 
                        @click="openStatusModal(ticket.id)"
                        class="text-indigo-600 hover:text-indigo-800"
                        title="Changer le statut">
                        <i class="fas fa-exchange-alt"></i>
                      </button>

                      <!-- Resolve -->
                      <button 
                        @click="openResolveModal(ticket.id)"
                        class="text-green-600 hover:text-green-800"
                        title="Résoudre">
                        <i class="fa-solid fa-clipboard-check"></i>
                      </button>

                      <!-- Close -->
                      <button 
                        @click="closeTicket(ticket.id)"
                        class="text-red-600 hover:text-red-800"
                        title="Fermer">
                        <i class="fa-solid fa-lock"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Change Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-white/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Changer le statut</h3>
        <div class="space-y-2">
          <button 
            @click="handleStatusChange('assigned')"
            class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
            :disabled="isProcessing">
            <i class="fas fa-spinner mr-2"></i>
            Attribué
          </button>
          <button 
            @click="handleStatusChange('in_progress')"
            class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
            :disabled="isProcessing">
            <i class="fas fa-spinner mr-2"></i>
            En cours
          </button>
          <button 
            @click="handleStatusChange('on_hold')"
            class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
            :disabled="isProcessing">
            <i class="fas fa-pause mr-2"></i>
            En attente
          </button>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button 
            @click="showStatusModal = false"
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            :disabled="isProcessing">
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Resolve Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 bg-white/30 backdrop-blur-sm  overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Résoudre le ticket</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Solution</label>
          <textarea
            v-model="solution"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez la solution apportée..."
            required
          ></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <button 
            @click="showResolveModal = false"
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            :disabled="isProcessing">
            Annuler
          </button>
          <button 
            @click="handleResolveTicket"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            :disabled="isProcessing || !solution.trim()">
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
            Résoudre
          </button>
        </div>
      </div>
    </div>
  </div>

 
</template>


 <style scoped>
.relative:focus-within > .hidden {
  display: block;
}
</style>