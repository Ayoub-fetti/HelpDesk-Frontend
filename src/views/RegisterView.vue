<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const userData = ref({
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const isSubmitting = ref(false)
const validationErrors = ref({})

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
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <RouterLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            sign in to your account
          </RouterLink>
        </p>
      </div>
      
      <div v-if="userStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-red-700">
              {{ userStore.error }}
            </p>
          </div>
        </div>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="submitRegistration">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="lastName" class="sr-only">last name</label>
            <input
            id="lastName"
            name="lastName"
            type="text"
            v-model="userData.lastName"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Last name"
            />
            <p v-if="validationErrors.lastName" class="mt-1 text-sm text-red-600">
                {{ validationErrors.lastName[0] }}
            </p>
        </div>
        <div>
            <label for="firstName" class="sr-only">first name</label>
            <input
            id="firstName"
            name="firstName"
            type="text"
            v-model="userData.firstName"
            required
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="First name"
            />
            <p v-if="validationErrors.firstName" class="mt-1 text-sm text-red-600">
                {{ validationErrors.firstName[0] }}
            </p>
        </div>
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              v-model="userData.email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
            <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600">
              {{ validationErrors.email[0] }}
            </p>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="userData.password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
            <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600">
              {{ validationErrors.password[0] }}
            </p>
          </div>
          <div>
            <label for="password-confirmation" class="sr-only">Confirm password</label>
            <input
              id="password-confirmation"
              name="password_confirmation"
              type="password"
              v-model="userData.password_confirmation"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || userStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span v-if="isSubmitting || userStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Loading spinner -->
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting || userStore.loading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>