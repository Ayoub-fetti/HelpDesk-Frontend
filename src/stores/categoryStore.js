import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryService } from '@/services'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null
      categories.value = await categoryService.getAll()
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des catégories'
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories
  }
})