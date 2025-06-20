import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services'

export const useAdminStore = defineStore('admin', () => {
  const users = ref([])
  const permissions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      users.value = await adminService.getUsers(params)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
    } finally {
      loading.value = false
    }
  }

  const fetchPermissions = async () => {
    try {
      loading.value = true
      error.value = null
      permissions.value = await adminService.fetchPermissions()
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des permissions'
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    permissions,
    loading,
    error,
    fetchUsers,
    fetchPermissions
  }
})