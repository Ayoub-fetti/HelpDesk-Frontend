<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()

const credentials = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submitLogin = async () => {
  isSubmitting.value = true
  validationErrors.value = {}
  
  try {
    await userStore.login(credentials.value)
  } catch (error) {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-gradient-to-br from-[#0B0F1C] to-[#0B1540] min-h-screen flex items-center justify-center font-sans">
      <div class="absolute top-8 left-8 text-white text-2xl font-semibold">
    <span class="italic">HelpDesk</span><span class="text-blue-500">.</span>
  </div>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
      <h2 class="text-2xl font-semibold mb-6">Connectez-vous à votre compte</h2>
      
      <div v-if="userStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-left">
        <p class="text-sm text-red-700">
          {{ userStore.error }}
        </p>
      </div>
      
      <form class="space-y-4 text-left" @submit.prevent="submitLogin">
        <div>
          <label for="email-address" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email-address"
            name="email"
            type="email"
            v-model="credentials.email"
            required
            placeholder="exemple@exemple.com"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
            {{ validationErrors.email[0] }}
          </p>
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 flex justify-between items-center">
            Mot De Passe
            <a href="#" class="text-blue-500 text-sm hover:underline">Oublié ?</a>
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              v-model="credentials.password"
              required
              placeholder="Entrer votre mot de passe"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10 outline-none"
            />
            <button 
              type="button" 
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
          <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">
            {{ validationErrors.password[0] }}
          </p>
        </div>

        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            v-model="credentials.remember"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Se souvenir de moi
          </label>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting || userStore.loading"
          class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors relative"
        >
          <span v-if="isSubmitting || userStore.loading" class="absolute left-4 inset-y-0 flex items-center">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting || userStore.loading ? 'Connexion en cours...' : 'Connectez-vous maintenant' }}
        </button>
      </form>

      <p class="mt-6 text-sm text-gray-500">
        Vous N'avez Pas De Compte ?
        <RouterLink to="/register" class="text-blue-500 hover:underline">S'inscrire</RouterLink>
      </p>
    </div>
  </div>
</template>