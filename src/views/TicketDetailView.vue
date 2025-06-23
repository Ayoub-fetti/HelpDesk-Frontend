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
const currentUser = computed(() => userStore.user)
const isResolved = computed(() => ticketStore.currentTicket?.statut === 'resolved')
const isClosed = computed(() => ticketStore.currentTicket?.statut === 'closed')
const showStatusModal = ref(false)
const showResolveModal = ref(false)
const solution = ref('')
const isProcessing = ref(false)

// Time tracking states
const timeTracking = ref(null)
const isTimeTrackingLoading = ref(false)
const isTimeRunning = ref(false)
const elapsedTime = ref(0)
const timeTrackingInterval = ref(null)


const openStatusModal = () => {
  showStatusModal.value = true
}

const openResolveModal = () => {
  solution.value = ''
  showResolveModal.value = true
}
const handleStatusChange = async (newStatus) => {
  try {
    isProcessing.value = true
    await ticketStore.changeStatus(ticketId.value, newStatus)
    showStatusModal.value = false
    await ticketStore.fetchTicket(ticketId.value)
  } catch (error) {
    console.error('Failed to change ticket status:', error)
  } finally {
    isProcessing.value = false
  }
}
const handleResolveTicket = async () => {
  if (!solution.value.trim()) return
  
  try {
    isProcessing.value = true
    await ticketStore.resolveTicket(ticketId.value, {
      solution: solution.value
    })
    showResolveModal.value = false
    await ticketStore.fetchTicket(ticketId.value)
  } catch (error) {
    console.error('Failed to resolve ticket:', error)
  } finally {
    isProcessing.value = false
  }
}
const closeTicket = async () => {
  try {
    await ticketStore.closeTicket(ticketId.value)
    await ticketStore.fetchTicket(ticketId.value)
  } catch (error) {
    console.error('Failed to close ticket:', error)
  }
}
// Check if user is staff (admin, supervisor, or technician)
const isStaff = computed(() => {
  if (!currentUser.value) return false
  const userType = currentUser.value.user_type
  return userType === 'administrator' || userType === 'supervisor' || userType === 'technician'
})

// Helper functions to determine file type
const isImageFile = (filename) => {
  if (!filename) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  return imageExtensions.some(ext => 
    filename.toLowerCase().endsWith(ext)
  )
}


const isVideoFile = (filename) => {
  if (!filename) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
  return videoExtensions.some(ext => 
    filename.toLowerCase().endsWith(ext)
  )
}

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
      const lastTracking = response[response.length - 1]
      
      if (lastTracking && lastTracking.duration) {
        // Convert stored duration (hours) to seconds
        elapsedTime.value = Math.floor(lastTracking.duration * 3600)
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
    if (!commentUsers.value[authorId]) {
      if (ticketStore.currentTicket) {
        if (ticketStore.currentTicket.user && ticketStore.currentTicket.user.id === authorId) {
          commentUsers.value[authorId] = {
            firstName: ticketStore.currentTicket.user.firstName,
            lastName: ticketStore.currentTicket.user.lastName,
            user_type: ticketStore.currentTicket.user.user_type // Make sure to include user_type
          }
        } else if (ticketStore.currentTicket.technician && ticketStore.currentTicket.technician.id === authorId) {
          commentUsers.value[authorId] = {
            firstName: ticketStore.currentTicket.technician.firstName,
            lastName: ticketStore.currentTicket.technician.lastName,
            user_type: ticketStore.currentTicket.technician.user_type // Make sure to include user_type
          }
        } else if (currentUser.value && currentUser.value.id === authorId) {
          commentUsers.value[authorId] = {
            firstName: currentUser.value.firstName,
            lastName: currentUser.value.lastName,
            user_type: currentUser.value.user_type // Make sure to include user_type
          }
        } else {
          commentUsers.value[authorId] = {
            firstName: 'Utilisateur',
            lastName: '#' + authorId,
            user_type: 'final_user' // Set default user type
          }
        }
      }
    }
    return commentUsers.value[authorId]
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    return { firstName: 'Utilisateur', lastName: '#' + authorId, user_type: 'final_user' }
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
      is_private: isPrivateComment.value ? 1 : 0 // Convertit le booléen en 0 ou 1
    })
    
    // Clear input and refresh comments
    newComment.value = ''
    isPrivateComment.value = false // Reset the checkbox
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
  const defaultUser = { firstName: 'Utilisateur', lastName: '', user_type: 'final_user' }
  const user = commentUsers.value[comment.author_id]
  if (!user) return defaultUser

  // Map user_type to French labels
  const userTypeLabels = {
    administrator: 'Administrateur',
    supervisor: 'Superviseur',
    technician: 'Technicien',
    final_user: 'Utilisateur'
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    userType: userTypeLabels[user.user_type] || 'Utilisateur'
  }
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <Navbar />
    
    <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Loading state -->
      <div v-if="isLoading" class="fixed inset-0 bg-white flex items-center justify-center z-50">

        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
      
      <template v-else-if="ticketStore.currentTicket">
        <!-- Main Ticket Panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Ticket Details -->
          <div class="bg-white rounded-2xl shadow p-6">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-lg font-semibold text-gray-700">
                  Ticket <span class="text-blue-600 font-bold">#{{ ticketStore.currentTicket.id.toString().padStart(3, '0') }}</span>
                </h1>
                <p class="text-sm text-gray-500">Créé le {{ formatDate(ticketStore.currentTicket.created_at) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span :class="[
                  getPriorityBadgeClass(ticketStore.currentTicket.priority),
                  'text-xs font-semibold px-2 py-1 rounded-full'
                ]">
                  {{ formatPriority(ticketStore.currentTicket.priority) }}
                </span>
                <div v-if="isStaff" class="text-right">
                  <p class="text-sm font-medium">Temps écoulé</p>
                  <p class="text-rose-600 text-lg font-bold">{{ formatDuration(elapsedTime) }}</p>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                <span class="font-medium text-gray-700">{{ ticketStore.currentTicket.user?.firstName }} {{ ticketStore.currentTicket.user?.lastName }}</span> 
                · ({{ ticketStore.currentTicket.user?.email }})
              </div>
              </div>
            </div>

            <div class="mt-4">

              <h2 class="text-xl font-bold mb-2">{{ ticketStore.currentTicket.title }}</h2>
            </div>

            <!-- Description -->
            <div class="mt-6">
              <h3 class="font-semibold mb-2 text-blue-700">Description du problème :</h3>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{ ticketStore.currentTicket.description }}</p>
            </div>

            <!-- Attachments -->
            <div class="mt-6" v-if="ticketStore.currentTicket.attachments?.length">
              <h3 class="font-semibold mb-2 text-blue-700">Pièces jointes ({{ ticketStore.currentTicket.attachments.length }})</h3>
              <div class="flex flex-col gap-2">
                <div v-for="attachment in ticketStore.currentTicket.attachments" 
                    :key="attachment.id" 
                    class="flex items-center gap-2 p-2 bg-gray-100 rounded-lg w-60">
                  <a :href="`/storage/${attachment.file_path}`" target="_blank">
                    <!-- Image files -->
                    <i v-if="isImageFile(attachment.file_name || attachment.name)" 
                     class="fas fa-images text-xl text-blue-500 hover:text-blue-300"></i>
                    <!-- Video files -->
                    <i v-else-if="isVideoFile(attachment.file_name || attachment.name)" 
                    class="fas fa-video text-xl text-orange-500 hover:text-orange-300"></i>
                    <!-- Document files -->
                    <i v-else 
                       class="fa-solid fa-print text-xl text-red-700 hover:text-red-300"></i>
                  </a>
                  <a :href="`/storage/${attachment.file_path}`" target="_blank" class="text-sm font-medium hover:text-blue-600">
                    {{ attachment.file_name || attachment.file_name }}
                  </a>
                </div>
              </div>
            </div>
          </div>


          <!-- Conversation -->
          <div class="bg-white rounded-2xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">
              Conversation ({{ comments.length }} messages)
            </h3>
            
            <!-- Comments list -->
            <div class="space-y-4 mb-6">
              <div v-for="comment in comments" 
                   :key="comment.id"
                   :class="[
                     'p-4 rounded-lg',
                     comment.is_private ? 'bg-yellow-50' : 'bg-gray-100'
                   ]">
                <div class="flex justify-between items-start mb-2">
                  <p>
                    <span :class="[
                      'font-semibold',
                      comment.is_private ? 'text-yellow-800' : 'text-gray-900'
                    ]">
                      {{ getCommentAuthor(comment).firstName }} {{ getCommentAuthor(comment).lastName }}
                    </span>
                        <span v-if="getCommentAuthor(comment).userType" class="ml-2 text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                        {{ getCommentAuthor(comment).userType }}
                    </span>
                    <span class="text-xs ml-2">
                       {{ formatDate(comment.created_at) }}
                      
                    </span>
                  </p>
                </div>
                <p class="text-sm text-gray-600">{{ comment.content }}</p>
              </div>
            </div>

            <!-- New comment form -->
            <div class="mt-4">
              <textarea
                v-model="newComment"
                rows="3"
                class="w-full p-3 border rounded-lg resize-none"
                placeholder="Tapez votre réponse..."
              ></textarea>
              <div class="mt-2 flex items-center justify-between">
                <!-- Ajout de la case à cocher pour les commentaires privés, visible uniquement pour les techniciens et admins -->
                <div v-if="isStaff" class="flex items-center">
                  <input type="checkbox" 
                         id="is-private" 
                         v-model="isPrivateComment"
                         class="rounded border-gray-300" />
                  <label for="is-private" class="ml-2 text-sm text-gray-600">
                    Commentaire privé
                  </label>
                </div>
                <button
                  @click="submitComment"
                  :disabled="submittingComment || !newComment.trim()"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {{ submittingComment ? 'Envoi...' : 'Envoyer' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Panel -->
        <div class="space-y-6">
          <!-- Info Card -->
          <div class="bg-white rounded-2xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">Informations</h3>
            <div class="space-y-2 text-sm text-gray-700">
              <p>
                <span class="font-semibold">Statut:</span>
                <span :class="[getStatusBadgeClass(ticketStore.currentTicket.statut), 'ml-2 px-2 py-1 rounded-full text-xs']">
                  {{ formatStatus(ticketStore.currentTicket.statut) }}
                </span>
              </p>
              <p><span class="font-semibold">Priorité:</span> {{ formatPriority(ticketStore.currentTicket.priority) }}</p>
              <p><span class="font-semibold">Catégorie:</span> {{ ticketStore.currentTicket.category?.name }}</p>
              <p><span class="font-semibold">Assigné à:</span> {{ ticketStore.currentTicket.technician?.firstName }} {{ ticketStore.currentTicket.technician?.lastName }}</p>
              <p><span class="font-semibold">Créé le:</span> {{ formatDate(ticketStore.currentTicket.created_at) }}</p>
              <p><span class="font-semibold">Dernière MAJ:</span> {{ formatDate(ticketStore.currentTicket.updated_at) }}</p>
            </div>
          </div>

          <!-- Time Tracking Card -->
          <div v-if="isStaff" class="bg-white rounded-2xl shadow p-6">
            <h3 class="font-semibold text-lg mb-4">Suivi du temps</h3>
            <div class="text-center">
              <div class="text-3xl font-bold mb-4">{{ formatDuration(elapsedTime) }}</div>
              <button
                v-if="!isTimeRunning"
                @click="startTimeTracking"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Démarrer le chrono
              </button>
              <button
                v-else
                @click="stopTimeTracking"
                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Arrêter
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="isStaff" class="mt-4 space-y-2">
            <h4 class="font-semibold text-gray-700">Actions</h4>
          <div class="flex flex-wrap gap-2">
              <!-- Change Status -->
          <button 
            @click="openStatusModal"
            class="flex items-center px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100"
          >
            <i class="fas fa-exchange-alt mr-2"></i>
            Changer le statut
          </button>

    <!-- Resolve -->
    <button 
      @click="openResolveModal"
      class="flex items-center px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
      v-if="!isResolved"
    >
      <i class="fa-solid fa-clipboard-check mr-2"></i>
      Résoudre
    </button>

    <!-- Close -->
    <button 
      @click="closeTicket"
      class="flex items-center px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
      v-if="!isClosed"
    >
      <i class="fa-solid fa-lock mr-2"></i>
      Fermer
    </button>
  </div>
</div>
        </div>
      </template>
    </div>
  </div>
  <!-- Status Change Modal -->
<div v-if="showStatusModal" class="fixed inset-0 bg-white/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
  <div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Changer le statut</h3>
    <div class="space-y-2">
      <button 
        @click="handleStatusChange('assigned')"
        class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
        :disabled="isProcessing">
        <i class="fas fa-clipboard-list mr-4"></i>
        Attribué
      </button>
      <button 
        @click="handleStatusChange('in_progress')"
        class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
        :disabled="isProcessing">
        <i class="fas fa-spinner mr-4"></i>
        En cours
      </button>
      <button 
        @click="handleStatusChange('on_hold')"
        class="w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
        :disabled="isProcessing">
        <i class="fas fa-pause mr-4"></i>
        En attente
      </button>
    </div>
    <div class="mt-6 flex justify-end gap-3">
      <button 
        @click="showStatusModal = false"
        class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        :disabled="isProcessing">
        <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
        Annuler
      </button>
    </div>
  </div>
</div>

<!-- Resolve Modal -->
<div v-if="showResolveModal" class="fixed inset-0 bg-white/30 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center z-50">
  <div class="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Résoudre le ticket</h3>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Solution</label>
      <textarea
        v-model="solution"
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        placeholder="Décrivez la solution apportée..."
        required
      ></textarea>
    </div>
    <div class="flex justify-end gap-3">
      <button 
        @click="showResolveModal = false"
        class="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
        :disabled="isProcessing">
        Annuler
      </button>
      <button 
        @click="handleResolveTicket"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        :disabled="isProcessing || !solution.trim()">
        <i v-if="isProcessing" class="fas fa-spinner fa-spin mr-2"></i>
        Résoudre
      </button>
    </div>
  </div>
</div>
</template>