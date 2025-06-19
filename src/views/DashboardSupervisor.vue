<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTicketStore, useUserStore } from '@/stores'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/layout/navbar.vue'
import api from '@/axios'

const ticketStore = useTicketStore()
const userStore = useUserStore()
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
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    
    <div class="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Tableau de bord superviseur</h1>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <i class="fas fa-clipboard-list text-blue-500 text-4xl"></i>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total tickets</p>
              <p class="mt-1 text-2xl font-semibold">{{ stats.totalTickets }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <i class="fas fa-check-circle text-green-500 text-3xl"></i>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Tickets résolus</p>
              <p class="mt-1 text-2xl font-semibold">{{ stats.resolvedTickets }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <i class="fas fa-users text-indigo-500 text-3xl"></i>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total techniciens</p>
              <p class="mt-1 text-2xl font-semibold">{{ stats.totalTechnicians }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Performance -->
      <div class="bg-white rounded-lg shadow mb-8">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">Performance de l'équipe</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="text-left text-gray-500 border-b">
                  <th class="pb-3">Technicien</th>
                  <th class="pb-3">Total tickets</th>
                  <th class="pb-3">Tickets résolus</th>
                  <th class="pb-3">Tickets assignés</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tech in techniciansPerformance" :key="tech.id" class="border-b">
                  <td class="py-3">{{ tech.firstName }} {{ tech.lastName }}</td>
                  <td class="py-3">{{ tech.totalTickets }}</td>
                  <td class="py-3">{{ tech.resolvedTickets }}</td>
                  <td class="py-3">{{ tech.assignedTickets }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- New Tickets Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">Nouveaux tickets à assigner</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="text-left text-gray-500 border-b">
                  <th class="pb-3">ID</th>
                  <th class="pb-3">Titre</th>
                  <th class="pb-3">Date création</th>
                  <th class="pb-3">Status</th>
                  <th class="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ticket in newTickets" :key="ticket.id" class="border-b">
                  <td class="py-3">#{{ ticket.id.toString().padStart(3, '0') }}</td>
                  <td class="py-3">{{ ticket.title }}</td>
                  <td class="py-3">{{ formatDate(ticket.created_at) }}</td>
                  <td class="py-3">{{ ticket.statut}}</td>
                  <td class="py-3">
                    <button 
                      @click="openAssignModal(ticket.id)"
                      class="text-blue-600 hover:text-blue-800 mr-3">
                      <i class="fas fa-user-plus"></i>
                    </button>
                    <button 
                      v-if="ticket.technician"
                      @click="removeAssignment(ticket.id)"
                      class="text-red-600 hover:text-red-800">
                      <i class="fas fa-user-minus"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="showAssignModal" class="fixed inset-0  bg-white/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Assigner un technicien</h3>
        <select v-model="selectedTechnicianId" class="w-full p-2 border rounded-md mb-4">
          <option selected v-for="tech in technicians" :key="tech.id" :value="tech.id">
            {{ tech.firstName }} {{ tech.lastName }}
          </option>
        </select>
        <div class="flex justify-end gap-3">
          <button 
            @click="showAssignModal = false"
            class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
            Annuler
          </button>
          <button 
            @click="assignTicket"
            :disabled="!selectedTechnicianId"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 " >
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
            Assigner
          </button>
        </div>
      </div>
    </div>
  </div>
</template>