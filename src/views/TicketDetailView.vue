<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore, useUserStore } from '@/stores'
import Navbar from '@/components/layout/navbar.vue'

const route = useRoute()
const ticketStore = useTicketStore()
const userStore = useUserStore()
const isLoading = ref(true)
const comments = ref([])
const commentUsers = ref({}) // Cache for user data
const loadingComments = ref(false)
const newComment = ref('')
const isPrivateComment = ref(false)
const submittingComment = ref(false)
const ticketId = computed(() => route.params.id)
const isAdmin = computed(() => userStore.isAdmin)
const currentUser = computed(() => userStore.user)

// Time tracking states
const timeTracking = ref(null)
const isTimeTrackingLoading = ref(false)
const isTimeRunning = ref(false)
const elapsedTime = ref(0)
const timeTrackingInterval = ref(null)

// Check if user is staff (admin, supervisor, or technician)
const isStaff = computed(() => {
  if (!currentUser.value) return false
  const userType = currentUser.value.user_type
  return userType === 'administrator' || userType === 'supervisor' || userType === 'technician'
})

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Format status and priority
const formatStatus = (status) => {
  const statusMap = {
    new: 'Nouveau',
    assigned: 'Attribué',
    in_progress: 'En cours',
    on_hold: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé',
    reopen: 'Rouvert'
  }
  return statusMap[status] || status
}

const formatPriority = (priority) => {
  const priorityMap = {
    low: 'Basse',
    average: 'Normale',
    high: 'Haute',
    urgent: 'Critique'
  }
  return priorityMap[priority] || priority
}

// Status badge classes
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'new': return 'bg-gray-100 text-gray-800'
    case 'assigned': return 'bg-blue-100 text-blue-800'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800'
    case 'on_hold': return 'bg-green-100 text-green-700'
    case 'resolved': return 'bg-gray-200 text-gray-600'
    case 'closed': return 'bg-gray-200 text-gray-600'
    case 'reopen': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Priority badge classes
const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'low': return 'bg-gray-200 text-gray-700'
    case 'average': return 'bg-blue-100 text-blue-600'
    case 'high': return 'bg-red-100 text-red-600'
    case 'urgent': return 'bg-pink-100 text-pink-600'
    default: return 'bg-gray-200 text-gray-700'
  }
}

// Format time duration with proper handling of different duration formats
function formatDuration(duration) {
  // Case 1: Handle formatted_duration object from backend
  if (duration?.formatted_duration) {
    const { hours, minutes, seconds } = duration.formatted_duration;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Case 2: Handle duration as decimal hours from backend
  if (typeof duration === 'number') {
    const totalSeconds = Math.floor(duration * 3600); // Convert hours to seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Case 3: Handle tracking object with duration property
  if (duration?.duration) {
    return formatDuration(duration.duration);
  }
  
  // Default case: return 00:00:00
  return '00:00:00';
}


// Fetch time tracking data
const fetchTimeTracking = async () => {
  if (!isStaff.value) return
  
  try {
    isTimeTrackingLoading.value = true
    const response = await ticketStore.getTimeTracking(ticketId.value)
    timeTracking.value = response
    
    // Check if there's an active tracking session
    const activeTracking = response.find(track => track.end_date === null)
    
    if (activeTracking) {
      isTimeRunning.value = true
      const startTime = new Date(activeTracking.start_date)
      const now = new Date()
      const initialElapsed = Math.floor((now - startTime) / 1000)
      elapsedTime.value = initialElapsed
      startTimeUpdateInterval()
    } else {
      // Get the last completed tracking session
      const lastTracking = [...response].sort((a, b) => 
        new Date(b.end_date) - new Date(a.end_date)
      )[0]
      
      if (lastTracking && typeof lastTracking.duration === 'number') {
        // Convert duration from hours (0.02) to seconds (72)
        elapsedTime.value = Math.round(lastTracking.duration * 3600)
      } else {
        elapsedTime.value = 0
      }
      isTimeRunning.value = false
    }
  } catch (error) {
    console.error('Failed to fetch time tracking data:', error)
  } finally {
    isTimeTrackingLoading.value = false
  }
}

// Start time update interval
const startTimeUpdateInterval = () => {
  // Clear any existing interval
  if (timeTrackingInterval.value) {
    clearInterval(timeTrackingInterval.value)
  }
  
  // Update elapsed time every second
  timeTrackingInterval.value = setInterval(() => {
    if (isTimeRunning.value) {
      elapsedTime.value += 1
    }
  }, 1000)
}

// Start time tracking
const startTimeTracking = async () => {
  try {
    await ticketStore.startTimeTracking(ticketId.value)
    isTimeRunning.value = true
    
    // Set current session start time to now
    if (!timeTracking.value) {
      timeTracking.value = { total_seconds: 0 }
    }
    timeTracking.value.current_session_start = new Date().toISOString()
    timeTracking.value.is_running = true
    
    // Start updating the timer
    startTimeUpdateInterval()
  } catch (error) {
    console.error('Failed to start time tracking:', error)
  }
}

// Stop time tracking
const stopTimeTracking = async () => {
  try {
    await ticketStore.stopTimeTracking(ticketId.value)
    isTimeRunning.value = false
    
    // Update tracking data with the final time
    if (!timeTracking.value) {
      timeTracking.value = {}
    }
    timeTracking.value.is_running = false
    timeTracking.value.total_seconds = elapsedTime.value
    timeTracking.value.duration = elapsedTime.value / 3600 // Convert seconds to hours
    
    // Clear the interval
    if (timeTrackingInterval.value) {
      clearInterval(timeTrackingInterval.value)
      timeTrackingInterval.value = null
    }
  } catch (error) {
    console.error('Failed to stop time tracking:', error)
  }
}

// Fetch user details for a comment author
const fetchCommentAuthor = async (authorId) => {
  try {
    // Check if we already have cached data
    if (!commentUsers.value[authorId]) {
      // Simulate user data lookup or make API call to get user info
      // This is where you'd make an API call to fetch user details
      
      // For now, we'll check if the author is the current ticket creator or technician
      if (ticketStore.currentTicket) {
        if (ticketStore.currentTicket.user && ticketStore.currentTicket.user.id === authorId) {
          commentUsers.value[authorId] = ticketStore.currentTicket.user
        } else if (ticketStore.currentTicket.technician && ticketStore.currentTicket.technician.id === authorId) {
          commentUsers.value[authorId] = ticketStore.currentTicket.technician
        } else if (currentUser.value && currentUser.value.id === authorId) {
          commentUsers.value[authorId] = currentUser.value
        } else {
          // Default fallback if user details can't be found
          commentUsers.value[authorId] = {
            firstName: 'Utilisateur',
            lastName: '#' + authorId
          }
        }
      }
    }
    return commentUsers.value[authorId]
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    return { firstName: 'Utilisateur', lastName: '#' + authorId }
  }
}

// Fetch comments
const fetchComments = async () => {
  try {
    loadingComments.value = true
    const response = await ticketStore.fetchComments(ticketId.value)
    comments.value = response || []
    
    // Fetch user details for each comment
    for (const comment of comments.value) {
      if (comment.author_id) {
        await fetchCommentAuthor(comment.author_id)
      }
    }
  } catch (error) {
    console.error('Failed to fetch comments:', error)
  } finally {
    loadingComments.value = false
  }
}

// Submit new comment
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    submittingComment.value = true
    
    await ticketStore.addComment(ticketId.value, {
      content: newComment.value,
      is_private: isPrivateComment.value
    })
    
    // Clear input and refresh comments
    newComment.value = ''
    isPrivateComment.value = false
    await fetchComments()
    
  } catch (error) {
    console.error('Failed to submit comment:', error)
  } finally {
    submittingComment.value = false
  }
}

// Fetch ticket details on component mount
onMounted(async () => {
  try {
    isLoading.value = true
    await ticketStore.fetchTicket(ticketId.value)
    await fetchComments()
    
    // If staff user, fetch time tracking data
    if (isStaff.value) {
      await fetchTimeTracking()
    }
  } catch (error) {
    console.error('Failed to fetch ticket details:', error)
  } finally {
    isLoading.value = false
  }
})

// Clean up intervals when component unmounts
onUnmounted(() => {
  if (timeTrackingInterval.value) {
    clearInterval(timeTrackingInterval.value)
  }
})

// Get comment author
const getCommentAuthor = (comment) => {
  return commentUsers.value[comment.author_id] || { firstName: 'Utilisateur', lastName: '' }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar/>
    
    <div class="max-w-7xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center py-10">
        <div class="text-gray-500">Chargement des détails du ticket...</div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="ticketStore.error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <p class="text-red-700">{{ ticketStore.error }}</p>
      </div>
      
      <!-- Ticket details -->
      <div v-else-if="ticketStore.currentTicket" class="bg-white shadow-md rounded-lg overflow-hidden">
        <!-- Ticket header -->
        <div class="border-b p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-semibold text-gray-800 mb-2">
                {{ ticketStore.currentTicket.title }}
              </h1>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>Ticket #{{ ticketStore.currentTicket.id }}</span>
                <span>•</span>
                <span>Créé le {{ formatDate(ticketStore.currentTicket.created_at) }}</span>
              </div>
            </div>
            
            <div class="flex gap-2">
              <span 
                :class="[getStatusBadgeClass(ticketStore.currentTicket.statut), 'px-3 py-1 rounded-full text-sm']"
              >
                {{ formatStatus(ticketStore.currentTicket.statut) }}
              </span>
              <span 
                :class="[getPriorityBadgeClass(ticketStore.currentTicket.priority), 'px-3 py-1 rounded-full text-sm']"
              >
                {{ formatPriority(ticketStore.currentTicket.priority) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Ticket body -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left column: Details -->
          <div class="md:col-span-2">
            <div class="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Description</h2>
              <p class="text-gray-700 whitespace-pre-line">{{ ticketStore.currentTicket.description }}</p>
            </div>
            
            <!-- Attachments section -->
            <div class="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Pièces jointes</h2>
              
              <div v-if="ticketStore.currentTicket.attachments && ticketStore.currentTicket.attachments.length > 0">
                <ul class="space-y-2">
                  <li v-for="(attachment, index) in ticketStore.currentTicket.attachments" :key="index" class="flex items-center gap-2 p-2 border rounded-md bg-white">
                    <i class="fas fa-paperclip text-gray-400"></i>
                    <a 
                      :href="`http://localhost:8000/storage/${attachment.path}`" 
                      target="_blank" 
                      class="text-blue-600 hover:underline"
                    >
                      {{ attachment.original_name || attachment.name }}
                    </a>
                  </li>
                </ul>
              </div>
              
              <div v-else class="text-gray-500 italic">
                Aucune pièce jointe pour ce ticket
              </div>
            </div>
            
            <!-- Comments section -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Conversation</h2>
              
              <!-- Comments loading state -->
              <div v-if="loadingComments" class="py-4 text-center text-gray-500">
                <i class="fas fa-circle-notch fa-spin mr-2"></i>
                Chargement des commentaires...
              </div>
              
              <!-- No comments state -->
              <div v-else-if="!comments.length" class="py-4 text-center text-gray-500">
                <p>Aucun commentaire pour le moment</p>
              </div>
              
              <!-- Comments list -->
              <div v-else class="space-y-4 mb-6">
                <div 
                  v-for="comment in comments" 
                  :key="comment.id" 
                  :class="[
                    'p-4 rounded-lg', 
                    comment.is_private ? 'bg-yellow-50 border border-yellow-100' : 'bg-white border border-gray-100'
                  ]"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center">
                      <div class="font-medium text-gray-800">
                        {{ getCommentAuthor(comment).firstName }} {{ getCommentAuthor(comment).lastName }}
                      </div>
                      <span v-if="comment.is_private" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <i class="fas fa-lock text-xs mr-1"></i>
                        Privé
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ formatDate(comment.created_at) }}
                    </div>
                  </div>
                  <p class="text-gray-700">{{ comment.content }}</p>
                </div>
              </div>
              
              <!-- New comment form -->
              <form @submit.prevent="submitComment" class="mt-4">
                <textarea
                  v-model="newComment"
                  rows="3"
                  placeholder="Ajouter un commentaire..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                
                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center" v-if="isAdmin">
                    <input 
                      id="is-private" 
                      type="checkbox" 
                      v-model="isPrivateComment" 
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label for="is-private" class="ml-2 text-sm text-gray-700">
                      Commentaire privé (visible uniquement par l'équipe technique)
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    :disabled="submittingComment || !newComment.trim()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <i v-if="submittingComment" class="fas fa-circle-notch fa-spin mr-2"></i>
                    {{ submittingComment ? 'Envoi...' : 'Envoyer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Right column: Meta information -->
          <div>
            <div class="bg-gray-50 p-6 rounded-lg">
              <h2 class="text-lg font-medium text-gray-800 mb-4">Informations</h2>
              
              <dl class="space-y-3">
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Catégorie</dt>
                  <dd class="text-sm text-gray-900">{{ ticketStore.currentTicket.category?.name || '-' }}</dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Demandeur</dt>
                  <dd class="text-sm text-gray-900">
                    {{ ticketStore.currentTicket.user?.firstName }} {{ ticketStore.currentTicket.user?.lastName }}
                  </dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="text-sm text-gray-900">{{ ticketStore.currentTicket.user?.email || '-' }}</dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Technicien</dt>
                  <dd class="text-sm text-gray-900">
                    <span v-if="ticketStore.currentTicket.technician">
                      {{ ticketStore.currentTicket.technician.firstName }} {{ ticketStore.currentTicket.technician.lastName }}
                    </span>
                    <span v-else>Non assigné</span>
                  </dd>
                </div>
                
                <div class="flex justify-between">
                  <dt class="text-sm font-medium text-gray-500">Mis à jour</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(ticketStore.currentTicket.updated_at) }}</dd>
                </div>
              </dl>
            </div>
            
            <!-- Time Tracking section - Only visible to staff users -->
            <div v-if="isStaff" class="bg-gray-50 p-6 rounded-lg mt-4">
              <h2 class="text-lg font-medium text-gray-800 mb-4">
                <i class="fas fa-clock mr-2 text-blue-600"></i>
                Suivi de temps
              </h2>
              
              <!-- Loading state -->
              <div v-if="isTimeTrackingLoading" class="flex justify-center py-4">
                <div class="text-gray-500">
                  <i class="fas fa-circle-notch fa-spin mr-2"></i>
                  Chargement...
                </div>
              </div>
              
              <!-- Time tracking content -->
              <div v-else class="space-y-4">
                <!-- Time counter -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div class="text-3xl font-mono">{{ formatDuration(elapsedTime) }}</div>
                  <div class="text-xs text-gray-500 mt-1">Heures : Minutes : Secondes</div>
                </div>
                
                <!-- Start/Stop buttons -->
                <div class="flex justify-center space-x-3">
                  <button 
                    v-if="!isTimeRunning" 
                    @click="startTimeTracking" 
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <i class="fas fa-play mr-2"></i>
                    Démarrer
                  </button>
                  
                  <button 
                    v-else 
                    @click="stopTimeTracking" 
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <i class="fas fa-stop mr-2"></i>
                    Arrêter
                  </button>
                </div>
                
                <!-- Status indicator -->
                <div class="text-center text-sm">
                  <span v-if="isTimeRunning" class="text-green-600 flex items-center justify-center">
                    <span class="relative flex h-3 w-3 mr-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Temps en cours d'enregistrement
                  </span>
                  <span v-else class="text-gray-500">
                    Temps total enregistré: {{ formatDuration(elapsedTime) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No ticket found state -->
      <div v-else class="bg-white p-6 rounded-lg shadow text-center">
        <p class="text-gray-500">Ce ticket n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  </div>
</template>