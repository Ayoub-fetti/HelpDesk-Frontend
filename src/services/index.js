import AuthService from './AuthService'
import TicketService from './TicketService'
import UserService from './UserService'
import NotificationService from './NotificationService'


// Export services for easy import
export {
  AuthService,
  TicketService,
  UserService,
  NotificationService
}

// Create instances for services that extend BaseService
export const ticketService = new TicketService()
export const userService = new UserService()
export const notificationService = new NotificationService()
