<script setup>
import { isRouteLoading } from '@/stores/loading'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main>
      <div v-if="isRouteLoading" class="fixed inset-0 bg-white flex items-center justify-center z-50">

        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
      <RouterView />
    </main>
  </div>
</template>