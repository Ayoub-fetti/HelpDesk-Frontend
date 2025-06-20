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

// Static roles
const ROLES = [
  'administrator',
  'supervisor',
  'technician',
  'final_user'
]

onMounted(async () => {
  await adminStore.fetchUsers()
})

// Open user modal for add/edit
const openUserModal = (user = null) => {
  isEdit.value = !!user
  selectedUser.value = user
  if (user) {
    userForm.value = { ...user, password: '' }
  } else {
    userForm.value = { firstName: '', lastName: '', email: '', user_type: '', password: '' }
  }
  showUserModal.value = true
}

// Save user (add or update)
const saveUser = async () => {
  const formData = { ...userForm.value }
  if (isEdit.value) {
    // Remove password if empty when editing
    if (!formData.password) {
      delete formData.password
    }
    await adminStore.updateUser(selectedUser.value.id, formData)
  } else {
    await adminStore.createUser(formData)
  }
  showUserModal.value = false
  await adminStore.fetchUsers()
}

// Delete user
const deleteUser = async (id) => {
  await adminStore.deleteUser(id)
  await adminStore.fetchUsers()
}

// Open role/permission modal
const openRoleModal = async (user) => {
  selectedUser.value = user
  await adminStore.fetchPermissions()
  // If adminStore.permissions is { permissions: [...] }, extract the array
  allPermissions.value = Array.isArray(adminStore.permissions)
    ? adminStore.permissions
    : adminStore.permissions.permissions || []
  roleForm.value = {
    roles: user.roles ? user.roles.map(r => r.name) : [],
    permissions: Object.fromEntries(
      (user.permissions || []).map(p => [p.name, true])
    )
  }
  showRoleModal.value = true
}

// Save roles/permissions
const saveRolesPermissions = async () => {
  const permissionsPayload = {}
  allPermissions.value.forEach(perm => {
    permissionsPayload[perm] = !!roleForm.value.permissions[perm]
  })

  await adminStore.assignRolePermissions(selectedUser.value.id, {
    permissions: permissionsPayload
  })
  showRoleModal.value = false
  await adminStore.fetchUsers()
}
</script>

<template>
  <Navbar/>
  <div class="flex min-h-screen">
    <Sidebar />
    <div class="flex-1 p-8">
      <h1 class="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th class="p-2">Nom</th>
            <th class="p-2">Email</th>
            <th class="p-2">Type</th>
            <th class="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in adminStore.users" :key="user.id">
            <td class="p-2">{{ user.firstName }} {{ user.lastName }}</td>
            <td class="p-2">{{ user.email }}</td>
            <td class="p-2">{{ user.user_type }}</td>
            <td class="p-2 flex gap-2">
              <button @click="openUserModal(user)" class="text-blue-600">Modifier</button>
              <button @click="openRoleModal(user)" class="text-indigo-600">Rôles/Permissions</button>
              <button @click="deleteUser(user.id)" class="text-red-600">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="openUserModal()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Ajouter un utilisateur</button>
      <!-- User Modal (CRUD) -->
      <div v-if="showUserModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-lg font-bold mb-4">{{ isEdit ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>
          <form @submit.prevent="saveUser">
            <input v-model="userForm.firstName" placeholder="Prénom" class="w-full mb-2 p-2 border rounded" required />
            <input v-model="userForm.lastName" placeholder="Nom" class="w-full mb-2 p-2 border rounded" required />
            <input v-model="userForm.email" placeholder="Email" class="w-full mb-2 p-2 border rounded" required type="email" />
            <!-- Role select -->
            <select v-model="userForm.user_type" class="w-full mb-2 p-2 border rounded" required>
              <option value="" disabled>Sélectionner un rôle</option>
              <option v-for="role in ROLES" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
            <input v-if="!isEdit" v-model="userForm.password" placeholder="Mot de passe" class="w-full mb-2 p-2 border rounded" required type="password" />
            <button type="submit" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded">{{ isEdit ? 'Mettre à jour' : 'Créer' }}</button>
            <button @click="showUserModal = false" type="button" class="mt-2 ml-2 px-4 py-2 bg-gray-300 rounded">Fermer</button>
          </form>
        </div>
      </div>
      <!-- Role/Permission Modal -->
      <div v-if="showRoleModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow w-96">
          <h2 class="text-lg font-bold mb-4">Assigner rôles et permissions</h2>
          <form @submit.prevent="saveRolesPermissions">
            <div class="mb-2">
              <label class="block mb-1 font-semibold">Rôles</label>
<div class="mb-2">
  <label class="block mb-1 font-semibold">Rôle</label>
  <div class="p-2 border rounded bg-gray-50">
    <span v-if="selectedUser && selectedUser.user_type">
      <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
        {{ selectedUser.user_type }}
      </span>
    </span>
    <span v-else class="text-gray-400">Aucun rôle</span>
  </div>
</div>
            </div>
            <div class="mb-2">
              <label class="block mb-1 font-semibold">Permissions</label>
              <div v-for="perm in allPermissions" :key="perm">
                <label>
                  <input type="checkbox" v-model="roleForm.permissions[perm]" />
                  {{ perm }}
                </label>
              </div>
            </div>
            <button type="submit" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">Enregistrer</button>
            <button @click="showRoleModal = false" type="button" class="mt-2 ml-2 px-4 py-2 bg-gray-300 rounded">Fermer</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>