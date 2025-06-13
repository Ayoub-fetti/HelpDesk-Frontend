<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { RouterLink } from 'vue-router'

const userStore = useUserStore()

const userData = ref({
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submitRegistration = async () => {
  isSubmitting.value = true
  validationErrors.value = {}
  
  try {
    await userStore.register(userData.value)
  } catch (error) {
    if (error.response?.status === 422) {
      validationErrors.value = error.response.data.errors || {}
    }
  } finally {
    isSubmitting.value = false
  }
}

const continueWithGoogle = () => {
  // Implement Google OAuth integration here
  console.log('Continue with Google clicked')
}
</script>

<template>
  <div class="flex w-full h-screen">
    <!-- Left panel -->
    <div class="w-1/2 bg-gradient-to-br from-[#0B0F1C] to-[#0B1540] text-white flex flex-col justify-center px-20">
      <div class="absolute top-8 left-8 text-2xl font-semibold">
        <span class="italic">HelpDesk</span><span class="text-blue-500">.</span>
      </div>
      <h1 class="text-4xl font-light leading-relaxed mt-20">
        Bienvenue.<br />
        Démarrez votre aventure dès maintenant avec notre système de gestion !
      </h1>
    </div>

    <!-- Right panel -->
    <div class="w-1/2 bg-gradient-to-bl from-white to-[#F0F5FF] flex items-center justify-center">
      <div class="bg-transparent rounded-lg w-full max-w-md mt-10 ">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Créer un compte</h2>
        
        <div v-if="userStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-left">
          <p class="text-sm text-red-700">
            {{ userStore.error }}
          </p>
        </div>
        
        <form class="space-y-2" @submit.prevent="submitRegistration">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              v-model="userData.firstName"
              required
              placeholder="Votre prénom"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p v-if="validationErrors.firstName" class="mt-1 text-sm text-red-600">
              {{ validationErrors.firstName[0] }}
            </p>
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              v-model="userData.lastName"
              required
              placeholder="Votre nom"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p v-if="validationErrors.lastName" class="mt-1 text-sm text-red-600">
              {{ validationErrors.lastName[0] }}
            </p>
          </div>
          
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              v-model="userData.email"
              required
              placeholder="exemple@exemple.com"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
              {{ validationErrors.email[0] }}
            </p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Mot De Passe</label>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                v-model="userData.password"
                required
                placeholder="Créer votre mot de passe"
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
          
          <div>
            <label for="password-confirmation" class="block text-sm font-medium text-gray-700">Confirmer Mot De Passe</label>
            <div class="relative">
              <input
                id="password-confirmation"
                :type="showPassword ? 'text' : 'password'"
                name="password_confirmation"
                v-model="userData.password_confirmation"
                required
                placeholder="Confirmez votre mot de passe"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || userStore.loading"
            class="w-full bg-blue-600 text-white py-2 mt-4 rounded-md hover:bg-blue-700 transition-colors relative"
          >
            <span v-if="isSubmitting || userStore.loading" class="absolute left-4 inset-y-0 flex items-center">
            </span>
            {{ isSubmitting || userStore.loading ? 'Création en cours...' : 'Créer votre compte' }}
          </button>
        </form>

        <p class="mt-4 mb-2 text-sm text-gray-600 text-center">
          Vous Avez Déjà Un Compte ?
          <RouterLink to="/login" class="text-blue-500 hover:underline">Se Connecter</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>