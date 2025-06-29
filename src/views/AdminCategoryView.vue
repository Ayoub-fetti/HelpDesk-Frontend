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
  <div class="flex flex-col md:flex-row min-h-screen">
    <Sidebar class="w-full md:w-64" />
    <div class="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50">
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

      <div class="max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold mb-4">Catégories</h1>
        
        <!-- Simple error display -->
        <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {{ errorMessage }}
        </div>
        
        <!-- Formulaire d'ajout -->
        <form @submit.prevent="createCategory" class="mb-4 flex flex-col sm:flex-row gap-2">
          <input 
            v-model="newCategory.name" 
            placeholder="Nom de la nouvelle catégorie" 
            class="border p-2 rounded flex-1" 
          />
          <button 
            type="submit" 
            class="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center" 
            :disabled="isProcessing"
          > 
            <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
            Ajouter
          </button>
        </form>

        <!-- Table des catégories -->
        <div class="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b">
                <th class="p-3 text-left">ID</th>
                <th class="p-3 text-left">Nom</th>
                <th class="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categoryStore.categories" :key="category.id" class="border-b hover:bg-gray-50">
                <td class="p-3">{{ category.id }}</td>
                <td class="p-3">
                  <div v-if="editingCategory && editingCategory.id === category.id">
                    <input v-model="editCategoryData.name" class="border p-1 rounded w-full" />
                  </div>
                  <div v-else>
                    {{ category.name }}
                  </div>
                </td>
                <td class="p-3">
                  <div v-if="editingCategory && editingCategory.id === category.id" class="flex flex-wrap gap-2">
                    <button 
                      @click="updateCategory" 
                      class="bg-green-500 text-white px-2 py-1 rounded flex items-center" 
                      :disabled="isProcessing2"
                    > 
                      <i v-if="isProcessing2" class="fas fa-spinner fa-spin mr-2"></i>
                      <span>Enregistrer</span>
                    </button>
                    <button @click="cancelEdit" class="bg-gray-300 px-2 py-1 rounded">
                      Annuler
                    </button>
                  </div>
                  <div v-else class="flex flex-wrap gap-2">
                    <button @click="startEditCategory(category)" class="bg-yellow-400 px-2 py-1 rounded">
                      <i class="fas fa-edit"></i>
                      <span class="hidden sm:inline ml-1">Modifier</span>
                    </button>
                    <button @click="deleteCategory(category.id)" class="bg-red-500 text-white px-2 py-1 rounded">
                      <i class="fas fa-trash"></i>
                      <span class="hidden sm:inline ml-1">Supprimer</span>
                    </button>
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
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}
</style>
