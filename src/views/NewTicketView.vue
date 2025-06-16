<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores'
import Navbar from '@/components/layout/navbar.vue'

const router = useRouter()
const ticketStore = useTicketStore()

const ticketData = ref({
  title: '',
  description: '',
  priority: '',
  category_id: '',
  phone: ''
})

const attachments = ref([])
const categories = ref([])
const isSubmitting = ref(false)
const validationErrors = ref({})
const submitSuccess = ref(false)

// Étape dynamique
const currentStep = computed(() => {
  if (!ticketData.value.title) return 1
  if (!ticketData.value.category_id || !ticketData.value.priority) return 2
  if (!ticketData.value.description) return 3
  return 4
})

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8000/api/categories')
    categories.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
})

const handleFileChange = (event) => {
  const files = event.target.files
  if (files) {
    attachments.value = Array.from(files)
  }
}

const submitTicket = async () => {
  try {
    isSubmitting.value = true
    validationErrors.value = {}

    const formData = new FormData()
    for (const key in ticketData.value) {
      if (ticketData.value[key] !== null && ticketData.value[key] !== '') {
        formData.append(key, ticketData.value[key])
      }
    }

    attachments.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    await ticketStore.createTicket(formData)
    submitSuccess.value = true

    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)

  } catch (error) {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
    console.error('Failed to create ticket:', error)
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
        <h1 class="text-2xl font-semibold text-gray-800 mb-4">Créer un nouveau ticket</h1>

        <!-- Étapes -->
        <div class="flex justify-between items-center mb-8">
          <template v-for="step in 3" :key="step">
            <div class="flex items-center space-x-2">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'
              ]">
                {{ step }}
              </div>
              <span class="text-sm font-medium text-gray-700">Étape {{ step }}</span>
            </div>
            <div v-if="step !== 3" class="flex-1 h-px bg-gray-300 mx-2"></div>
          </template>
        </div>

        <!-- Message de succès -->
        <div v-if="submitSuccess" class="mb-6 bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
          <p>Votre ticket a été créé avec succès! Vous allez être redirigé vers le tableau de bord.</p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitTicket" class="space-y-6">
          <!-- Étape 1 : Titre -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Titre *</label>
            <input
              v-model="ticketData.title"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Résumé de votre problème"
            />
            <p v-if="validationErrors.title" class="text-sm text-red-600">{{ validationErrors.title[0] }}</p>
          </div>

          <!-- Étape 2 : Catégorie + Priorité -->
          <div v-if="currentStep >= 2">
            <label class="block text-sm font-medium text-gray-700">Catégorie *</label>
            <select
              v-model="ticketData.category_id"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Sélectionnez une catégorie</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <p v-if="validationErrors.category_id" class="text-sm text-red-600">{{ validationErrors.category_id[0] }}</p>
          </div>

          <div v-if="currentStep >= 2">
            <label class="block text-sm font-medium text-gray-700">Priorité *</label>
            <select
              v-model="ticketData.priority"
              required
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

          <!-- Étape 3 : Description -->
          <div v-if="currentStep >= 3">
            <label class="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              v-model="ticketData.description"
              rows="5"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre problème en détail"
            ></textarea>
            <p v-if="validationErrors.description" class="text-sm text-red-600">{{ validationErrors.description[0] }}</p>
          </div>

          <!-- Téléphone -->
          <div v-if="currentStep >= 3">
            <label class="block text-sm font-medium text-gray-700">Téléphone (optionnel)</label>
            <input
              v-model="ticketData.phone"
              type="tel"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: +212..."
            />
          </div>

          <!-- Pièces jointes -->
          <div v-if="currentStep >= 3">
            <label class="block text-sm font-medium text-gray-700">Pièces jointes</label>
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
              :disabled="isSubmitting || currentStep < 3"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 flex items-center"
            >
              <svg v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ isSubmitting ? 'Création...' : 'Soumettre le ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
