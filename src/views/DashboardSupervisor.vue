<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketStore} from '@/stores'
import Navbar from '@/components/layout/navbar.vue'
import api from '@/axios'

const ticketStore = useTicketStore()
const isLoading = ref(true)
const showAssignModal = ref(false)
const selectedTicketId = ref(null)
const selectedTechnicianId = ref(null)
const technicians = ref([])
const isProcessing = ref(false)

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([
      ticketStore.fetchTickets(),
      fetchTechnicians()
    ])
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
})

// Stats computed properties
const stats = computed(() => {
  const tickets = ticketStore.tickets
  return {
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter(t => t.statut === 'resolved').length,
    totalTechnicians: technicians.value.length
  }
})

// Get technicians performance
const techniciansPerformance = computed(() => {
  return technicians.value.map(tech => ({
    ...tech,
    totalTickets: ticketStore.tickets.filter(t => t.technician?.id === tech.id).length,
    resolvedTickets: ticketStore.tickets.filter(t => t.technician?.id === tech.id && t.statut === 'resolved').length,
    assignedTickets: ticketStore.tickets.filter(t => t.technician?.id === tech.id && t.statut === 'assigned').length
  }))
})

// Get new tickets that need assignment 
const newTickets = computed(() => {
  return ticketStore.tickets.filter(t => t.statut === 'new' || t.statut === 'assigned')
})

// Helper functions
const fetchTechnicians = async () => {
  try {
    const response = await api.get('/api/users')
    // Filter only technicians from the users array in the response
    const techniciansList = response.data.users.filter(user => user.user_type === 'technician')
    technicians.value = techniciansList
  } catch (error) {
    console.error('Failed to fetch technicians:', error)
  }
}

const openAssignModal = (ticketId) => {
  selectedTicketId.value = ticketId
  showAssignModal.value = true
}

const assignTicket = async () => {
  if (!selectedTicketId.value || !selectedTechnicianId.value) return
  
  try {
    isProcessing.value = true
    await ticketStore.assignTicket(selectedTicketId.value, selectedTechnicianId.value)
    await ticketStore.fetchTickets()
    showAssignModal.value = false
    selectedTicketId.value = null
    selectedTechnicianId.value = null
  } catch (error) {
    console.error('Failed to assign ticket:', error)
  } finally {
    isProcessing.value = false
  }
}

const removeAssignment = async (ticketId) => {
  try {
    await ticketStore.removeAssignment(ticketId)
    await ticketStore.fetchTickets()
  } catch (error) {
    console.error('Failed to remove assignment:', error)
  }
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

 const capitalizeName = (name) =>  {
    return name.split(' ')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
  }
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <Navbar />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <!-- Header -->
      <h1 class="text-3xl font-bold tracking-tight">Tableau de bord superviseur</h1>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
          <i class="fas fa-clipboard-list text-blue-600 text-4xl"></i>
          <div>
            <p class="text-sm font-medium text-gray-500">Total tickets</p>
            <p class="text-2xl font-semibold">{{ stats.totalTickets }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
          <i class="fas fa-check-circle text-green-600 text-4xl"></i>
          <div>
            <p class="text-sm font-medium text-gray-500">Tickets résolus</p>
            <p class="text-2xl font-semibold">{{ stats.resolvedTickets }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
          <i class="fas fa-users text-indigo-600 text-4xl"></i>
          <div>
            <p class="text-sm font-medium text-gray-500">Total techniciens</p>
            <p class="text-2xl font-semibold">{{ stats.totalTechnicians }}</p>
          </div>
        </div>
      </section>

      <!-- Team Performance Table -->
      <section class="bg-white rounded-2xl shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Performance de l'équipe</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="border-b text-gray-500">
              <tr>
                <th class="pb-3">Technicien</th>
                <th class="pb-3">Total tickets</th>
                <th class="pb-3">Tickets résolus</th>
                <th class="pb-3">Tickets assignés</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tech in techniciansPerformance" :key="tech.id" class="border-b hover:bg-gray-50">
                <td class="py-3 font-bold">{{capitalizeName( tech.firstName )}} {{capitalizeName( tech.lastName) }}</td>
                <td class="py-3">{{ tech.totalTickets }}</td>
                <td class="py-3">{{ tech.resolvedTickets }}</td>
                <td class="py-3">{{ tech.assignedTickets }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- New Tickets Table -->
      <section class="bg-white rounded-2xl shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Nouveaux tickets à assigner</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left">
            <thead class="border-b text-gray-500">
              <tr>
                <th class="pb-3">ID</th>
                <th class="pb-3">Titre</th>
                <th class="pb-3">Date création</th>
                <th class="pb-3">Status</th>
                <th class="pb-3">Technicien</th>
                <th class="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in newTickets" :key="ticket.id" class="border-b hover:bg-gray-50">
                <td class="py-3 font-mono">#{{ ticket.id.toString().padStart(3, '0') }}</td>
                <td class="py-3">{{ ticket.title }}</td>
                <td class="py-3">{{ formatDate(ticket.created_at) }}</td>
                <td class="py-3">
                    <span 
                    :class="{
                        'bg-blue-100 text-blue-700': ticket.statut === 'new',
                        'bg-orange-100 text-orange-700': ticket.statut === 'assigned'
                    }"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    >
                    {{ ticket.statut }}
                    </span>
                </td>
                <td class="py-3 font-bold">
                  {{ ticket.technician ? capitalizeName(`${ticket.technician.firstName} ${ticket.technician.lastName}`) : '-' }}
                </td>
                <td class="py-3 flex gap-3 items-center">
                  <button
                    @click="openAssignModal(ticket.id)"
                    class="text-blue-600 hover:text-blue-800 transition"
                  >
                    <i class="fa-solid fa-person-arrow-down-to-line"></i>
                  </button>
                  <button
                    v-if="ticket.technician"
                    @click="removeAssignment(ticket.id)"
                    class="text-red-600 hover:text-red-800 transition"
                  >
                    <i class="fa-solid fa-person-circle-xmark"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Assign Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium mb-4">Assigner un technicien</h3>
        <select v-model="selectedTechnicianId" class="w-full px-3 py-2 border rounded-md mb-4">
          <option disabled value="">Sélectionner un technicien</option>
          <option v-for="tech in technicians" :key="tech.id" :value="tech.id">
            {{ tech.firstName }} {{ tech.lastName }}
          </option>
        </select>
        <div class="flex justify-end gap-3">
          <button
            @click="showAssignModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Annuler
          </button>
          <button
            @click="assignTicket"
            :disabled="!selectedTechnicianId"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
            Assigner
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

