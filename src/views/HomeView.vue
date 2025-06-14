<script setup>
import { RouterLink } from 'vue-router'
import Navbar from '@/components/layout/navbar.vue'

</script>

<template>
  <div>
    <Navbar />
    
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-[#0B0F1C] to-[#0B1540] text-white py-20">
      <div class="container mx-auto px-6 lg:px-20">
        <div class="flex flex-col lg:flex-row items-center">
          <div class="lg:w-1/2 mb-10 lg:mb-0">
            <h1 class="text-4xl lg:text-5xl font-light leading-tight mb-6">
              Solution de gestion de tickets simplifiée
            </h1>
            <p class="text-xl opacity-80 mb-8 leading-relaxed">
              Un outil complet pour gérer les demandes d'assistance technique et résoudre les problèmes efficacement.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <RouterLink 
                to="/register" 
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition"
              >
                Créer un compte
              </RouterLink>
              <RouterLink 
                to="/login" 
                class="px-8 py-3 border border-white hover:bg-white hover:text-blue-900 text-white font-medium rounded-md text-center transition"
              >
                Se connecter
              </RouterLink>
            </div>
          </div>
          <div class="lg:w-1/2 ml-8 flex justify-center">
            <img src="@/assets/h.png" alt="HelpDesk" class="w-3/4 max-w-md">
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gradient-to-bl from-white to-[#F0F5FF]">
      <div class="container mx-auto px-6 lg:px-20">
        <h2 class="text-3xl font-semibold text-center mb-12 text-gray-800">Fonctionnalités principales</h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-800">Gestion de tickets</h3>
            <p class="text-gray-600">Créez, suivez et gérez facilement vos demandes d'assistance technique.</p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-800">Communication efficace</h3>
            <p class="text-gray-600">Échangez en temps réel avec les techniciens assignés à votre demande.</p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-800">Suivi de statut</h3>
            <p class="text-gray-600">Visualisez l'état d'avancement de vos tickets en temps réel.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-br from-[#0B0F1C] to-[#0B1540] text-white">
      <div class="container mx-auto px-6 lg:px-20 text-center">
        <h2 class="text-3xl font-light mb-6">Prêt à commencer ?</h2>
        <p class="text-xl opacity-80 mb-8 max-w-2xl mx-auto">
          Rejoignez notre plateforme dès maintenant et simplifiez la gestion de vos demandes d'assistance.
        </p>
        <RouterLink 
          to="/register" 
          class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
        >
          Créer un compte gratuitement
        </RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8">
      <div class="container mx-auto px-6 lg:px-20">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <h2 class="text-2xl font-semibold">HelpDesk<span class="text-blue-500">.</span></h2>
          </div>
          <div class="text-sm text-gray-400">
            &copy; {{ new Date().getFullYear() }} HelpDesk. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>