import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ticketService } from '@/services'

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref([])
  const currentTicket = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Get all tickets
  const fetchTickets = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.getAll(filters)
      tickets.value = response.data || response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tickets'
    } finally {
      loading.value = false
    }
  }

  // Get a single ticket
  const fetchTicket = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.getOne(id)
      currentTicket.value = response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch ticket'
    } finally {
      loading.value = false
    }
  }

  // Create a new ticket
  const createTicket = async (ticketData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.create(ticketData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update a ticket
  const updateTicket = async (id, ticketData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.update(id, ticketData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a ticket
 const deleteTicket = async (id) => {
  try {
    loading.value = true
    error.value = null

    console.log(`Attempting to delete ticket with ID: ${id}`)
    
    // Make the delete API call
    await ticketService.delete(id)
    
    // If successful, remove the ticket from the store's state
    tickets.value = tickets.value.filter(ticket => ticket.id !== id)
    console.log(`Successfully deleted ticket with ID: ${id}`)
    
    return true
  } catch (err) {
    console.error(`Error deleting ticket ${id}:`, err)
    error.value = err.response?.data?.message || `Failed to delete ticket #${id}`
    throw err
  } finally {
    loading.value = false
  }
}

  // Add a comment to a ticket
  const addComment = async (ticketId, commentData) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.addComment(ticketId, commentData)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add comment'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch comments for a ticket
  const fetchComments = async (ticketId) => {
    try {
      loading.value = true
      error.value = null

      const response = await ticketService.getComments(ticketId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch comments'
      throw err
    } finally {
      loading.value = false
    }
  }
  const getTimeTracking = async (ticketId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.getTimeTracking(ticketId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch time tracking data'
      throw err
    } finally {
      loading.value = false
    }
  }
  const startTimeTracking = async (ticketId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.startTimeTracking(ticketId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to start time tracking'
      throw err
    } finally {
      loading.value = false
    }
  }
  const stopTimeTracking = async (ticketId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.stopTimeTracking(ticketId)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to stop time tracking'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const closeTicket = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.closeTicket(id)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to close ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resolveTicket = async (id, data) => {
    try {

      loading.value = true
      error.value = null
      
      const response = await ticketService.resolveTicket(id, data)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to resolve ticket'
      throw err
    } finally {
      loading.value = false
    }
  }

const changeStatus = async (ticketId, statut) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await ticketService.changeStatus(ticketId, statut)
    // Refresh tickets list after successful status change
    await fetchTickets()
    return response
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to change status'
    throw err
  } finally {
    loading.value = false
  }
}

const assignTicket = async (ticketId, userId) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await ticketService.assignTicket(ticketId, userId)
    
    // Refresh the current ticket data after assignment
    await fetchTicket(ticketId)
    
    return response
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to assign ticket'
    throw err
  } finally {
    loading.value = false
  }
}

const removeAssignment = async (ticketId) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await ticketService.removeAssignment(ticketId)
    
    // Refresh the current ticket data after removing assignment
    await fetchTicket(ticketId)
    
    return response
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to remove ticket assignment'
    throw err
  } finally {
    loading.value = false
  }
}

  const uploadAttachments = async (ticketId, attachments) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await ticketService.uploadAttachments(ticketId, attachments)
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to upload attachments'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tickets,
    currentTicket,
    loading,
    error,
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    addComment,
    fetchComments,
    getTimeTracking,
    startTimeTracking,
    stopTimeTracking,
    closeTicket,
    resolveTicket,
    changeStatus,
    assignTicket,
    removeAssignment,
    uploadAttachments
  }
})