import AuthService from './AuthService'
import TicketService from './TicketService'
import UserService from './UserService'

// Export services for easy import
export {
  AuthService,
  TicketService,
  UserService
}

// Create instances for services that extend BaseService
export const ticketService = new TicketService()
export const userService = new UserService()
