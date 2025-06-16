import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Setup authentication check
const userStore = useUserStore(pinia)

// Check auth status before navigation
router.beforeEach(async (to, from, next) => {
  // If not already checked auth status and not on login/register/public pages
  const publicRoutes = ['login', 'register', 'home', 'contact-us'];
  
  if (!userStore.user && !publicRoutes.includes(to.name)) {
    try {
      await userStore.checkAuth()
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // Route protection logic
  const requiresAuth = !publicRoutes.includes(to.name)
  const requiresAdmin = to.name === 'admin'

  if (requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (requiresAdmin && !userStore.isAdmin) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

app.mount('#app')