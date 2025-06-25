<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/layout/navbar.vue'
import Sidebar from '@/components/layout/sidebar.vue'
import { useAdminStore } from '@/stores'

const adminStore = useAdminStore()
const showUserModal = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref(null)
const userForm = ref({ firstName: '', lastName: '', email: '', user_type: '', password: '' })
const isEdit = ref(false)
const roleForm = ref({ roles: [], permissions: {} })
const allPermissions = ref([])


const ROLES = [
  'administrator',
  'supervisor',
  'technician',
  'final_user'
]

onMounted(async () => {
  await adminStore.fetchUsers()
})

const openUserModal = (user = null) => {
  isEdit.value = !!user
  selectedUser.value = user
  userForm.value = user ? { ...user, password: '' } : { firstName: '', lastName: '', email: '', user_type: '', password: '' }
  showUserModal.value = true
}

const saveUser = async () => {
  const formData = { ...userForm.value }
  if (isEdit.value) {
    if (!formData.password) delete formData.password
    await adminStore.updateUser(selectedUser.value.id, formData)
  } else {
    await adminStore.createUser(formData)
  }
  showUserModal.value = false
  await adminStore.fetchUsers()
}

const deleteUser = async (id) => {
  if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
    await adminStore.deleteUser(id)
    await adminStore.fetchUsers()
  }
}

const openRoleModal = async (user) => {
  selectedUser.value = user
  await adminStore.fetchPermissions()
  allPermissions.value = Array.isArray(adminStore.permissions) 
    ? adminStore.permissions 
    : adminStore.permissions.permissions || []

  roleForm.value = {
    roles: user.roles ? user.roles.map(r => r.name) : [],
    permissions: Object.fromEntries((user.permissions || []).map(p => [p.name, true]))
  }
  showRoleModal.value = true
}

const saveRolesPermissions = async () => {
  const permissionsPayload = {}
  allPermissions.value.forEach(perm => {
    permissionsPayload[perm] = !!roleForm.value.permissions[perm]
  })
  await adminStore.assignRolePermissions(selectedUser.value.id, { permissions: permissionsPayload })
  showRoleModal.value = false
  await adminStore.fetchUsers()
}
</script>

<template>
  <Navbar/>
  <div class="flex min-h-screen">
    <Sidebar />
    <!-- Overlay de chargement -->
    <div
      v-if="adminStore.loading"
      class="fixed inset-0 bg-white flex items-center justify-center z-50"
    >
      <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
    </div>
    <div class="p-4 flex-1">
      <h1 class="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>

      <button @click="openUserModal()" class="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded">Ajouter un utilisateur</button>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th class="border p-2 text-left">Nom complet</th>
              <th class="border p-2 text-left">Email</th>
              <th class="border p-2 text-left">Type</th>
              <th class="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in adminStore.users" :key="user.id">
              <td class="border p-2">
                {{ user.firstName }} {{ user.lastName }}
              </td>
              <td class="border p-2">{{ user.email }}</td>
              <td class="border p-2">{{ user.user_type }}</td>
              <td class="border p-2">
                <button @click="openUserModal(user)" class="bg-yellow-400 hover:bg-yellow-600 px-2 py-1 rounded mr-2">Modifier</button>
                <button @click="openRoleModal(user)" class="bg-indigo-500 hover:bg-indigo-700 px-2 py-1 text-white rounded mr-2">Permissions</button>
                <button @click="deleteUser(user.id)" class="bg-red-500 hover:bg-red-700 px-2 py-1 text-white rounded">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- User Modal -->
      <div v-if="showUserModal" class="fixed inset-0  bg-white/30 backdrop-blur-sm flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-96">

          <h2 class="text-lg font-bold mb-4">{{ isEdit ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>

          <!-- error display  -->
           <div v-if="adminStore.error" class="bg-red-50 border-l-4 border-red-400 p-3 mb-4 text-left">
            <p class="text-sm text-red-700"> {{ adminStore.error }}</p>
           </div>
          <form @submit.prevent="saveUser">
            <input v-model="userForm.firstName" placeholder="Prénom" class="w-full mb-2 p-2 border rounded" required />
            <input v-model="userForm.lastName" placeholder="Nom" class="w-full mb-2 p-2 border rounded" required />
            <input v-model="userForm.email" type="email" placeholder="Email" class="w-full mb-2 p-2 border rounded" required />
            <select v-model="userForm.user_type" class="w-full mb-2 p-2 border rounded" required>
              <option value="" disabled>Choisir un rôle</option>
              <option v-for="role in ROLES" :key="role" :value="role">{{ role }}</option>
            </select>
            <input v-if="!isEdit" v-model="userForm.password" type="password" placeholder="Mot de passe" class="w-full mb-2 p-2 border rounded" required />
            <div class="flex justify-end">
              <button type="button" @click="showUserModal = false" class="px-4 py-2 bg-gray-300 rounded mr-2">Annuler</button>
              <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">{{ isEdit ? 'Mettre à jour' : 'Créer' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Role Modal -->
      <div v-if="showRoleModal" class="fixed inset-0  bg-white/30 backdrop-blur-sm flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-lg font-bold mb-4">Gérer les permissions</h2>
          
          <!-- error display  -->
           <div v-if="adminStore.error" class="bg-red-50 border-l-4 border-red-400 p-3 mb-4 text-left">
            <p class="text-sm text-red-700"> {{ adminStore.error }}</p>
           </div>
          <form @submit.prevent="saveRolesPermissions">
            <div class="mb-4">
              <div class="font-semibold mb-1">Rôle actuel:</div>
              <div class="p-2 border rounded bg-gray-50">
                {{ selectedUser?.user_type || 'Aucun' }}
              </div>
            </div>
            <div class="mb-4">
              <div class="font-semibold mb-1">Permissions:</div>
              <div v-for="perm in allPermissions" :key="perm" class="mb-1">
                <label>
                  <input type="checkbox" v-model="roleForm.permissions[perm]" class="mr-2" /> {{ perm }}
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" @click="showRoleModal = false" class="px-4 py-2 bg-gray-300 rounded mr-2">Annuler</button>
              <button type="submit" class="px-4 py-2 bg-indigo-500 text-white rounded">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>
