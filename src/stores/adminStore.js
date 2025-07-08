import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services'

export const useAdminStore = defineStore('admin', () => {const users = ref([])
  const permissions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const errorMessage = ref('')

  const fetchUsers = async (params = {}) => {
    try {
      loading.value = true
      error.value = null
      users.value = (await adminService.getUsers(params)).users
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs'
    } finally {
      loading.value = false
    }
  }
    const createUser = async (userData) => {
    try {
      loading.value = true
      error.value = null
      await adminService.createUser(userData)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur'
      errorMessage.value = err.response?.data?.message
      throw err
    } finally {
      loading.value = false
    }
  }

    const updateUser = async (id, userData) => {
    try {
      loading.value = true
      error.value = null
      await adminService.updateUser(id, userData)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur'
      throw err
    } finally {
      loading.value = false
    }
  }
    const deleteUser = async (id) => {
    try {
      loading.value = true
      error.value = null
      await adminService.deleteUser(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur'
      throw err
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
  const assignRolePermissions = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      await adminService.assignRolePermissions(id, data)
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'assignation des permissions'
      throw err
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
    fetchPermissions,
    createUser,
    updateUser,
    deleteUser,
    assignRolePermissions
  }
})