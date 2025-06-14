import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/dashboard/technician',
      name: 'dashboard-technician',
      component: () => import('../views/DashboardTechnician.vue'),
    },
    {
      path: '/dashboard/supervisor',
      name: 'dashboard-supervisor',
      component: () => import('../views/DashboardSupervisor.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/tickets/new',
      name: 'new-ticket',
      component: () => import('../views/NewTicketView.vue'),
    },
    {
      path: '/tickets/update',
      name: 'update-ticket',
      component: () => import('../views/UpdateTicketView.vue'),
    },
    {
      path: '/ticket/:id',
      name: 'ticket_detail',
      component: () => import('../views/TicketDetailView.vue'),
    }
  ],
})

export default router
