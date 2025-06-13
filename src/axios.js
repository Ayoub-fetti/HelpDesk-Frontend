import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true // This is important for cookies
})

// Set headers after creating the instance (as recommended by your professor)
api.defaults.headers.common['Content-Type'] = 'application/json'
api.defaults.headers.common['Accept'] = 'application/json'
api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Add interceptors to handle CSRF token
api.interceptors.response.use(
    response => {
        return response
    },
    error => {
        // Log detailed error info for debugging
        console.error('API Error:', error.response?.status, error.response?.data)
        return Promise.reject(error)
    }
)

export default api