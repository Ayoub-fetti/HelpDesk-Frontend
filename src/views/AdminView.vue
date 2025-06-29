<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/layout/navbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
import { useTicketStore, useAdminStore } from '@/stores'

const ticketStore = useTicketStore()
const adminStore = useAdminStore()
const isLoading = ref(true)

onMounted(async () => {
  try {
    await Promise.all([
      ticketStore.fetchTickets(),
      adminStore.fetchUsers()
    ])
  } finally {
    isLoading.value = false
  }
})

const totalTicketsNew = computed(() =>
  ticketStore.tickets.filter(t => t.statut === 'new').length
)
const totalTicketsResolved = computed(() =>
  ticketStore.tickets.filter(t => t.statut === 'resolved').length
)
const totalTechnicians = computed(() =>
  adminStore.users.filter(u => u.user_type === 'technician').length
)
const totalSupervisors = computed(() =>
  adminStore.users.filter(u => u.user_type === 'supervisor').length
)
const totalFinalUsers = computed(() =>
  adminStore.users.filter(u => u.user_type === 'final_user').length
)
</script>

<template>
  <Navbar />
  <div class="flex flex-col md:flex-row min-h-screen">
    <Sidebar class="w-full md:w-64" />
    <div class="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50">
      <div class="max-w-4xl mx-auto mt-10 space-y-6">
        <div class="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p class="text-gray-800">
            Bienvenue sur l'application
            <span class="font-semibold text-blue-700">HelpDesk</span> de gestion des tickets d'assistance.<br>
            Vous êtes connecté en tant qu'<span class="font-semibold">administrateur</span>.
            Votre rôle consiste à gérer les utilisateurs, les catégories de tickets,
            et à consulter les statistiques globales de la plateforme.
          </p>
        </div>

        <div v-if="isLoading" class="text-center text-gray-500">Chargement...</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow p-6 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ totalTicketsNew }}</div>
            <div class="text-gray-700 mt-2">Tickets Nouveaux</div>
          </div>
          <div class="bg-white rounded-xl shadow p-6 text-center">
            <div class="text-2xl font-bold text-green-600">{{ totalTicketsResolved }}</div>
            <div class="text-gray-700 mt-2">Tickets Résolus</div>
          </div>
          <div class="bg-white rounded-xl shadow p-6 text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ totalTechnicians }}</div>
            <div class="text-gray-700 mt-2">Techniciens</div>
          </div>
          <div class="bg-white rounded-xl shadow p-6 text-center">
            <div class="text-2xl font-bold text-orange-600">{{ totalSupervisors }}</div>
            <div class="text-gray-700 mt-2">Superviseurs</div>
          </div>
          <div class="bg-white rounded-xl shadow p-6 text-center">
            <div class="text-2xl font-bold text-pink-600">{{ totalFinalUsers }}</div>
            <div class="text-gray-700 mt-2">Utilisateurs finaux</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
