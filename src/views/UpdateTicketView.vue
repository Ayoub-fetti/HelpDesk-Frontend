<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketStore } from '@/stores'
import Navbar from '@/components/layout/navbar.vue'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()

const ticketData = ref({
  title: '',
  description: '',
  priority: '',
  category_id: ''
})

const attachments = ref([])
const currentAttachments = ref([]) // To store existing attachments
const categories = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const validationErrors = ref({})
const submitSuccess = ref(false)
const ticketId = computed(() => route.query.id)

// Fetch ticket data and categories on component mount
onMounted(async () => {
  try {
    isLoading.value = true

    // Fetch ticket details
    if (ticketId.value) {
      await ticketStore.fetchTicket(ticketId.value)
      if (ticketStore.currentTicket) {
        // Populate all available fields from the original ticket
        ticketData.value = {
          title: ticketStore.currentTicket.title || '',
          description: ticketStore.currentTicket.description || '',
          priority: ticketStore.currentTicket.priority || '',
          category_id: ticketStore.currentTicket.category_id || ''
        }
        
        // Store existing attachments if available
        if (ticketStore.currentTicket.attachments) {
          currentAttachments.value = ticketStore.currentTicket.attachments
        }
      }
    } else {
      router.push('/dashboard')
      return
    }

    // Fetch categories
    const response = await fetch('http://localhost:8000/api/categories')
    categories.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
})

const handleFileChange = (event) => {
  const files = event.target.files
  if (files) {
    attachments.value = Array.from(files)
  }
}

const updateTicket = async () => {
  try {
    isSubmitting.value = true
    validationErrors.value = {}

    const formData = new FormData()
    // Use the _method parameter to simulate a PUT request through POST
    formData.append('_method', 'PUT')
    
    // Add all fields, including empty ones to allow clearing values
    for (const key in ticketData.value) {
      formData.append(key, ticketData.value[key] !== null ? ticketData.value[key] : '')
    }

    // Add new attachments
    attachments.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    await ticketStore.updateTicket(ticketId.value, formData)
    submitSuccess.value = true

    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)

  } catch (error) {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
    console.error('Failed to update ticket:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="max-w-4xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h1 class="text-2xl font-semibold text-gray-800 mb-6">Modifier le ticket</h1>

        <!-- Loading state -->
        <div v-if="isLoading" class="py-10 text-center">
          <p class="text-gray-500">Chargement des données du ticket...</p>
        </div>

        <!-- Success message -->
        <div v-else-if="submitSuccess" class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
          <p>Votre ticket a été mis à jour avec succès! Vous allez être redirigé vers le tableau de bord.</p>
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="updateTicket" class="space-y-6">
          <!-- Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Titre</label>
            <input
              v-model="ticketData.title"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Résumé de votre problème"
            />
            <p v-if="validationErrors.title" class="text-sm text-red-600">{{ validationErrors.title[0] }}</p>
          </div>

          <!-- Catégorie -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              v-model="ticketData.category_id"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <p v-if="validationErrors.category_id" class="text-sm text-red-600">{{ validationErrors.category_id[0] }}</p>
          </div>

          <!-- Priorité -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Priorité</label>
            <select
              v-model="ticketData.priority"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Sélectionnez une priorité</option>
              <option value="low">Basse</option>
              <option value="average">Normale</option>
              <option value="high">Haute</option>
              <option value="urgent">Critique</option>
            </select>
            <p v-if="validationErrors.priority" class="text-sm text-red-600">{{ validationErrors.priority[0] }}</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              v-model="ticketData.description"
              rows="5"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre problème en détail"
            ></textarea>
            <p v-if="validationErrors.description" class="text-sm text-red-600">{{ validationErrors.description[0] }}</p>
          </div>


          <!-- Current Attachments (if any) -->
          <div v-if="currentAttachments.length > 0">
            <label class="block text-sm font-medium text-gray-700">Pièces jointes actuelles</label>
            <ul class="mt-2 space-y-1 text-sm text-gray-600 pl-5 list-disc">
              <li v-for="(attachment, index) in currentAttachments" :key="index">
                {{ attachment.original_name || attachment.name }}
              </li>
            </ul>
          </div>

          <!-- Pièces jointes -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Nouvelles pièces jointes (optionnel)</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48" stroke="currentColor">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label for="file-upload" class="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Choisir des fichiers</span>
                    <input id="file-upload" name="attachments" type="file" multiple class="sr-only" @change="handleFileChange" />
                  </label>
                  <p class="pl-1">ou glisser-déposer</p>
                </div>
                <p class="text-xs text-gray-500">PDF, PNG, JPG jusqu'à 10 Mo</p>
                <ul v-if="attachments.length" class="mt-2 text-left list-disc pl-5 text-sm">
                  <li v-for="(file, i) in attachments" :key="i">{{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)</li>
                </ul>
              </div>
            </div>
            <p v-if="validationErrors['attachments.0']" class="text-sm text-red-600 mt-1">{{ validationErrors['attachments.0'][0] }}</p>
          </div>

          <!-- Boutons -->
          <div class="flex justify-end pt-6">
            <button
              type="button"
              @click="router.push('/dashboard')"
              class="mr-4 px-4 py-2 bg-white border border-gray-300 text-sm rounded-md shadow-sm hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 flex items-center"
            >
              <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour le ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>