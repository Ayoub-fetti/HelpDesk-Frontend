import AuthService from './AuthService'
import TicketService from './TicketService'
import NotificationService from './NotificationService'
import AdminService from './AdminService'
import CategoryService from './CategoryService'


// Export services for easy import
export {
  AuthService,
  TicketService,
  NotificationService,
  AdminService,
  CategoryService
}

// Create instances for services that extend BaseService
export const ticketService = new TicketService()
export const notificationService = new NotificationService()
export const adminService = new AdminService()
export const categoryService = new CategoryService()
