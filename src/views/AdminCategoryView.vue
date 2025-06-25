<script setup>
import Navbar from '@/components/layout/navbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { categoryService } from '@/services'
import { ref, onMounted } from 'vue'

const categoryStore = useCategoryStore()
const newCategory = ref({ name: '' })
const editingCategory = ref(null)
const editCategoryData = ref({ name: '' })
const isProcessing = ref(false)
const isProcessing2 = ref(false)
const errorMessage = ref('')

onMounted(() => {
  categoryStore.fetchCategories()
})

// CRUD methods
const createCategory = async () => {
  try {
    isProcessing.value = true 
    if (newCategory.value.name.trim() === '') return
    await categoryService.createCategory(newCategory.value)
    newCategory.value.name = ''
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Failed to create category:', error)
    errorMessage.value = error.response?.data?.message 
  } finally {
    isProcessing.value = false
  }
}

const startEditCategory = (category) => {
  editingCategory.value = category
  editCategoryData.value = { ...category }
}

const updateCategory = async () => {
  try {
    isProcessing2.value = true
    if (editCategoryData.value.name.trim() === '') return
    await categoryService.updateCategory(editingCategory.value.id, editCategoryData.value)
    editingCategory.value = null
    await categoryStore.fetchCategories()
  } catch (error) {
    console.error('Failed to update category:', error)
    errorMessage.value = error.response?.data?.message 
  } finally {
    isProcessing2.value = false
  }
}

const cancelEdit = () => {
  editingCategory.value = null
}

const deleteCategory = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
    await categoryService.deleteCategory(id)
    await categoryStore.fetchCategories()
  }
}
</script>

<template>
  <Navbar/>
  <div class="flex min-h-screen">
    <Sidebar />
    <div class="p-4 flex-1 relative">
      <!-- Overlay de chargement -->
      <div
        v-if="categoryStore.loading"
        class="fixed inset-0 bg-white flex items-center justify-center z-50"
      >
        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <h1 class="text-2xl font-bold mb-4">Catégories</h1>
      <!-- Simple error display -->
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        {{ errorMessage }}
      </div>
      <!-- Formulaire d'ajout -->
      <form @submit.prevent="createCategory" class="mb-4 flex gap-2">
        <input v-model="newCategory.name" placeholder="Nom de la nouvelle catégorie" class="border p-2 rounded" />
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded" :disabled="isProcessing"> <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-4"></i>Ajouter</button>
      </form>

      <!-- Table des catégories -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="border p-2 text-left">ID</th>
              <th class="border p-2 text-left">Nom</th>
              <th class="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categoryStore.categories" :key="category.id">
              <td class="border p-2">{{ category.id }}</td>
              <td class="border p-2">
                <div v-if="editingCategory && editingCategory.id === category.id">
                  <input v-model="editCategoryData.name" class="border p-1 rounded w-full" />
                </div>
                <div v-else>
                  {{ category.name }}
                </div>
              </td>
              <td class="border p-2">
                <div v-if="editingCategory && editingCategory.id === category.id">
                  <button @click="updateCategory" class="bg-green-500 text-white px-2 py-1 rounded mr-2" :disabled="isProcessing2"> <i v-if="isProcessing2" class="fas fa-spinner fa-spin mr-4"></i>Enregistrer</button>
                  <button @click="cancelEdit" class="bg-gray-300 px-2 py-1 rounded">Annuler</button>
                </div>
                <div v-else>
                  <button @click="startEditCategory(category)" class="bg-yellow-400 px-2 py-1 rounded mr-2"> Modifier</button>
                  <button @click="deleteCategory(category.id)" class="bg-red-500 text-white px-2 py-1 rounded">Supprimer</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Affichage des états -->
      <div v-if="categoryStore.loading" class="mt-4 text-blue-500">Chargement...</div>
      <div v-if="categoryStore.error" class="mt-4 text-red-500">{{ categoryStore.error }}</div>
    </div>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
