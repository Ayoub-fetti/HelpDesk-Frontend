import { defineStore } from "pinia";
import { ref } from "vue";
import { AuthService } from "@/services";
import { useRouter } from "vue-router";

export const useUserStore = defineStore('user', () => {
    const router = useRouter()
    const user = ref(null)
    const isAuthenticated = ref(false)
    const isAdmin = ref(false)
    const error = ref(null)
    const loading = ref(false)

    // load user data if authenticated 
    const checkAuth = async () => {
        try {
            loading.value = true
            const userData = await AuthService.getCurrentUser()
            user.value = userData
            isAuthenticated.value = true
            // Check if user has admin permissions (fixed typo)
            isAdmin.value = user.value.user_type === 'administrator' 
        } catch (err) {
            console.error("Auth check failed:", err)
            user.value = null
            isAuthenticated.value = false
            isAdmin.value = false
        } finally {
            loading.value = false
        }
    }

    // login user 
const login = async (credentials) => {
  try {
    loading.value = true
    error.value = null
    
    // Login with AuthService
    await AuthService.login(credentials)
    
    // get user data 
    await checkAuth()
    
    if (isAuthenticated.value && user.value) {
      // Redirect based on user role
      switch (user.value.user_type) {
        case 'administrator':
          router.push({ name: 'admin' })
          break
        case 'supervisor':
          router.push({ name: 'dashboard-supervisor' })
          break
        case 'technician': 
          router.push({ name: 'dashboard-technician' })
          break
        default:
          router.push({ name: 'dashboard' })
          break
      }
    } else {
      error.value = 'Authentication failed'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
    user.value = null
    isAuthenticated.value = false
  } finally {
    loading.value = false
  }
}

    // register user 
    const register = async (userData) => {
        try {
            loading.value = true
            error.value = null
            
            // Register with AuthService
            await AuthService.register(userData)
            
            // Instead of auto-login, just return success
            router.push({ 
                name: 'login', 
                query: { registered: 'success' } 
            })
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Registration failed'
            loading.value = false
            return false
        } finally {
            loading.value = false
        }
    }
    
    const logout = async () => {
        try {
            loading.value = true
            await AuthService.logout()
        } catch(err) {
            error.value = err.response?.data?.message || 'Logout failed'
        } finally {
            user.value = null
            isAuthenticated.value = false
            isAdmin.value = false
            loading.value = false
            router.push({name: 'login'})
        }
    }

    return {
        user,
        isAuthenticated,
        isAdmin,
        error,
        loading,
        login,
        register,
        logout,
        checkAuth
    }
})