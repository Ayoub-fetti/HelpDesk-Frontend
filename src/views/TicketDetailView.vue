<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore } from '@/stores'
import Navbar from '@/components/layout/navbar.vue'

const route = useRoute()
const ticketStore = useTicketStore()
const isLoading = ref(true)
const ticketId = computed(() => route.params.id)

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Format status and priority
const formatStatus = (status) => {
  const statusMap = {
    new: 'Nouveau',
    assigned: 'Attribué',
    in_progress: 'En cours',
    on_hold: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé',
    reopen: 'Rouvert'
  }
  return statusMap[status] || status
}

const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Basse',
    average: 'Normale',
    high: 'Haute',
    urgent: 'Critique'
  }
  return priorityMap[priority] || priority
}

// Status badge classes
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'new': return 'bg-gray-100 text-gray-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'on_hold': return 'bg-green-100 text-green-700'
    case 'resolved': return 'bg-gray-200 text-gray-600'
    case 'closed': return 'bg-gray-200 text-gray-600'
    case 'reopen': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Priority badge classes
const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-gray-200 text-gray-700'
    case 'average': return 'bg-blue-100 text-blue-600'
    case 'high': return 'bg-red-100 text-red-600'
    case 'urgent': return 'bg-pink-100 text-pink-600'
    default: return 'bg-gray-200 text-gray-700'
  }
}

// Fetch ticket details on component mount
onMounted(async () => {
  try {
    isLoading.value = true
    await ticketStore.fetchTicket(ticketId.value)
  } catch (error) {
    console.error('Failed to fetch ticket details:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar/>
    
    <div class="max-w-7xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-10">
        <div class="text-gray-500">Chargement des détails du ticket...</div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="ticketStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p class="text-red-700">{{ ticketStore.error }}</p>
      </div>
      
      <!-- Ticket details -->
      <div v-else-if="ticketStore.currentTicket" class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Ticket header -->
        <div class="border-b p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-semibold text-gray-800 mb-2">
                {{ ticketStore.currentTicket.title }}
              </h1>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>Ticket #{{ ticketStore.currentTicket.id }}</span>
                <span>•</span>
                <span>Créé le {{ formatDate(ticketStore.currentTicket.created_at) }}</span>
              </div>
            </div>
            
            <div class="flex gap-2">
              <span 
                :class="[getStatusBadgeClass(ticketStore.currentTicket.statut), 'px-3 py-1 rounded-full text-sm']"
              >
                {{ formatStatus(ticketStore.currentTicket.statut) }}
              </span>
              <span 
                :class="[getPriorityBadgeClass(ticketStore.currentTicket.priority), 'px-3 py-1 rounded-full text-sm']"
              >
                {{ formatPriority(ticketStore.currentTicket.priority) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Ticket body -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left column: Details -->
          <div class="md:col-span-2">
            <div class="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Description</h2>
              <p class="text-gray-700 whitespace-pre-line">{{ ticketStore.currentTicket.description }}</p>
            </div>
            
            <!-- Attachments section -->
            <div class="bg-gray-50 p-6 rounded-lg">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Pièces jointes</h2>
            
            <div v-if="ticketStore.currentTicket.attachments && ticketStore.currentTicket.attachments.length > 0">
                <ul class="space-y-2">
                <li v-for="(attachment, index) in ticketStore.currentTicket.attachments" :key="index" class="flex items-center gap-2 p-2 border rounded-md bg-white">
                    <i class="fas fa-paperclip text-gray-400"></i>
                    <a 
                    :href="`http://localhost:8000/storage/${attachment.path}`" 
                    target="_blank" 
                    class="text-blue-600 hover:underline"
                    >
                    {{ attachment.original_name || attachment.name }}
                    </a>
                </li>
                </ul>
            </div>
  
  <div v-else class="text-gray-500 italic">
    Aucune pièce jointe pour ce ticket
  </div>
</div>
          </div>
          
          <!-- Right column: Meta information -->
          <div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Informations</h2>
              
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Catégorie</dt>
                  <dd class="text-sm text-gray-900">{{ ticketStore.currentTicket.category?.name || '-' }}</dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Demandeur</dt>
                  <dd class="text-sm text-gray-900">
                    {{ ticketStore.currentTicket.user?.firstName }} {{ ticketStore.currentTicket.user?.lastName }}
                  </dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="text-sm text-gray-900">{{ ticketStore.currentTicket.user?.email || '-' }}</dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Technicien</dt>
                  <dd class="text-sm text-gray-900">
                    <span v-if="ticketStore.currentTicket.technician">
                      {{ ticketStore.currentTicket.technician.firstName }} {{ ticketStore.currentTicket.technician.lastName }}
                    </span>
                    <span v-else>Non assigné</span>
                  </dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Mis à jour</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(ticketStore.currentTicket.updated_at) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No ticket found state -->
      <div v-else class="bg-white p-6 rounded-lg shadow text-center">
        <p class="text-gray-500">Ce ticket n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  </div>
</template>