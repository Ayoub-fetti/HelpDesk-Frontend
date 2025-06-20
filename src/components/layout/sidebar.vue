<script setup>
import { RouterLink } from 'vue-router'
</script>


<template>
  <aside class="w-64 h-full bg-gray-50 shadow-md flex flex-col">
    <div class="p-6 border-b">
      <h2 class="text-xl font-bold text-blue-700">Admin Panel</h2>
    </div>
    <nav class="flex-1 p-4 space-y-2">

      <RouterLink
        to="/admin"
        class="block px-4 py-2 rounded hover:bg-blue-100"
        active-class="bg-blue-200 text-blue-900 font-semibold"
      >
        Dashboard
      </RouterLink>

      <RouterLink
        to="/admin/users"
        class="block px-4 py-2 rounded hover:bg-blue-100"
        active-class="bg-blue-200 text-blue-900 font-semibold"
      >
        Utilisateurs
      </RouterLink>

      <RouterLink
        to="/admin/categories"
        class="block px-4 py-2 rounded hover:bg-blue-100"
        active-class="bg-blue-200 text-blue-900 font-semibold"
      >
        Catégories
      </RouterLink>

    </nav>
  </aside>
</template>



<style scoped>
aside {
  min-height: 100vh;
}
</style>