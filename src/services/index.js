import AuthService from './AuthService'
import TicketService from './TicketService'
import NotificationService from './NotificationService'


// Export services for easy import
export {
  AuthService,
  TicketService,
  NotificationService
}

// Create instances for services that extend BaseService
export const ticketService = new TicketService()
export const notificationService = new NotificationService()
