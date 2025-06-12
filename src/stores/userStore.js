import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/axios";
import { useRouter } from "vue-router";

export const useCounterStore = defineStore('user', () => {
    const router = useRouter()
    const user = ref(null)
    const isAuthenticated = ref(false)
    const isAdmin = ref(false)
    const error = ref(null)
    const loading = ref(false)

    // load user data if authentificated 

    const checkAuth = async () => {
        try {
            loading.value = true
            const response = await api.get('http://localhost:8000/api/user')
            user.value = response.data
            isAuthenticated.value = true
            // Check if user has admin permissions
            isAdmin.value = user.value.role === 'administartor'
        } catch (err) {
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

            // CSRF COOKIE
            await api.get('/csrf-cookie')
            
            //login
            await api.post('http://127.0.0.1:8000/api/login', credentials)
            
            // get user data
            await checkAuth()
            router.push({ name: 'dashboard'})

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
            
            // CSRF COOKIE
            await api.get('/csrf-cookie')
            
            // register
            await api.post('http://127.0.0.1:8000/api/register', userData)
            
            // get user data
            await checkAuth()
            router.push({ name: 'dashboard'})
        } catch (err) {
            error.value = err.response?.data?.message || 'Register failed'
        } finally {
            loading.value = false
        }
    }
    const logout = async () => {
        try {

            loading.value = true
            await api.post('http://127.0.0.1:8000/api/logout')      
        } catch(err) {
            error.value = err.response?.data?.message || 'Logout failed'
        } finally{
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