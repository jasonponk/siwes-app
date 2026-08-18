<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Manage Vacancies</h1>
            <p class="page-sub">Post and manage your SIWES placement vacancies</p>
          </div>
          <button class="btn btn-primary" @click="openModal()">+ Post New Vacancy</button>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>

        <div v-else-if="!vacancies.length" class="empty-state">
          <div class="empty-icon">📌</div>
          <h3>No vacancies yet</h3>
          <p>Post your first SIWES vacancy to start receiving student applications.</p>
          <button class="btn btn-primary" style="margin-top:16px" @click="openModal()">Post Vacancy</button>
        </div>

        <div v-else class="vacancies-list">
          <div v-for="vac in vacancies" :key="vac.id" class="vac-card">
            <div class="vac-card-header">
              <div>
                <div class="vac-title">{{ vac.title }}</div>
                <div class="vac-meta">
                  <span>📍 {{ vac.location }}</span>
                  <span>👥 {{ vac.availableSlots }} slot(s)</span>
                  <span>⏰ Deadline: {{ formatDate(vac.deadline) }}</span>
                  <span>📅 Posted: {{ formatDate(vac.createdAt) }}</span>
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:center">
                <span :class="vac.status === 'open' ? 'badge-success' : 'badge-neutral'" class="badge">
                  {{ vac.status }}
                </span>
                <button class="btn btn-ghost btn-sm" @click="openModal(vac)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(vac.id)">Delete</button>
              </div>
            </div>
            <p class="vac-desc">{{ vac.description }}</p>
            <div v-if="vac.requiredSkills?.length" class="vac-skills">
              <span v-for="s in vac.requiredSkills" :key="s" class="tag">{{ s }}</span>
            </div>
            <div class="vac-stats">
              <span>📥 {{ applicationCounts[vac.id] || 0 }} application(s)</span>
              <button
                class="btn btn-ghost btn-sm"
                @click="toggleVacStatus(vac)"
              >{{ vac.status === 'open' ? '🔒 Close Vacancy' : '🔓 Reopen' }}</button>
            </div>
          </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal" style="max-width:600px">
            <div class="modal-header">
              <h3>{{ editingVac ? 'Edit Vacancy' : 'Post New Vacancy' }}</h3>
              <button class="modal-close" @click="closeModal">×</button>
            </div>
            <div class="modal-body">
              <div v-if="formError" class="alert alert-error" style="margin-bottom:16px">{{ formError }}</div>
              <div class="form-group">
                <label class="form-label">Vacancy Title</label>
                <input v-model="vacForm.title" type="text" class="form-control" placeholder="e.g. Software Engineering Intern" required />
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select v-model="vacForm.category" class="form-control">
                    <option value="">Select Category</option>
                    <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input v-model="vacForm.location" type="text" class="form-control" placeholder="e.g. Lagos" />
                </div>
                <div class="form-group">
                  <label class="form-label">Available Slots</label>
                  <input v-model.number="vacForm.availableSlots" type="number" min="1" class="form-control" />
                </div>
                <div class="form-group">
                  <label class="form-label">Duration</label>
                  <input v-model="vacForm.duration" type="text" class="form-control" placeholder="e.g. 3 months" />
                </div>
                <div class="form-group">
                  <label class="form-label">Allowance (₦/month)</label>
                  <input v-model="vacForm.allowance" type="text" class="form-control" placeholder="e.g. 25,000" />
                </div>
                <div class="form-group">
                  <label class="form-label">Application Deadline</label>
                  <input v-model="vacForm.deadlineStr" type="date" class="form-control" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="vacForm.description" class="form-control" rows="3" placeholder="Describe the placement role and what students will do..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Required Skills</label>
                <TagsInput v-model="vacForm.requiredSkills" placeholder="e.g. Python, AutoCAD..." />
              </div>
              <div class="form-group">
                <label class="form-label">Preferred Departments</label>
                <TagsInput v-model="vacForm.preferredDepts" placeholder="e.g. Computer Science, Electrical Engineering..." />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="handleSaveVac" :disabled="saving">
                <span v-if="saving" class="loader" style="width:16px;height:16px;border-width:2px"></span>
                <span v-else>{{ editingVac ? 'Update' : 'Post Vacancy' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import TagsInput from '@/components/TagsInput.vue'
import { useAuthStore } from '@/store/auth'
import { getVacanciesByIndustry, postVacancy, updateVacancy, deleteVacancy, getPlacementsByIndustry } from '@/firebase/services'

const authStore = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const vacancies = ref([])
const applicationCounts = ref({})
const editingVac = ref(null)
const formError = ref('')

const categories = [
  'ICT / Software', 'Banking / Finance', 'Oil & Gas', 'Manufacturing',
  'Healthcare', 'Telecommunications', 'Construction', 'Agriculture',
  'Media / Broadcasting', 'Government / Public Sector', 'Pharmaceuticals',
  'Automotive', 'Energy', 'Retail / Commerce', 'Logistics', 'Other'
]

const defaultVacForm = () => ({
  title: '', category: '', location: '', availableSlots: 1,
  duration: '', allowance: '', deadlineStr: '',
  description: '', requiredSkills: [], preferredDepts: []
})
const vacForm = ref(defaultVacForm())

const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const openModal = (vac = null) => {
  editingVac.value = vac
  formError.value = ''
  if (vac) {
    vacForm.value = {
      title: vac.title || '', category: vac.category || '',
      location: vac.location || '', availableSlots: vac.availableSlots || 1,
      duration: vac.duration || '', allowance: vac.allowance || '',
      deadlineStr: vac.deadline ? new Date(vac.deadline).toISOString().split('T')[0] : '',
      description: vac.description || '',
      requiredSkills: vac.requiredSkills || [],
      preferredDepts: vac.preferredDepts || []
    }
  } else {
    vacForm.value = defaultVacForm()
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editingVac.value = null }

const handleSaveVac = async () => {
  if (!vacForm.value.title) { formError.value = 'Title is required'; return }
  saving.value = true; formError.value = ''
  try {
    const data = {
      ...vacForm.value,
      deadline: vacForm.value.deadlineStr ? new Date(vacForm.value.deadlineStr).getTime() : null
    }
    delete data.deadlineStr
    if (editingVac.value) {
      await updateVacancy(editingVac.value.id, data)
      const idx = vacancies.value.findIndex(v => v.id === editingVac.value.id)
      if (idx !== -1) vacancies.value[idx] = { ...vacancies.value[idx], ...data }
    } else {
      const id = await postVacancy(authStore.user.uid, data)
      vacancies.value.unshift({ ...data, id, industryUid: authStore.user.uid, status: 'open', createdAt: Date.now() })
    }
    closeModal()
  } catch (e) {
    formError.value = e.message
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Delete this vacancy? This cannot be undone.')) return
  await deleteVacancy(id)
  vacancies.value = vacancies.value.filter(v => v.id !== id)
}

const toggleVacStatus = async (vac) => {
  const newStatus = vac.status === 'open' ? 'closed' : 'open'
  await updateVacancy(vac.id, { status: newStatus })
  vac.status = newStatus
}

onMounted(async () => {
  try {
    const uid = authStore.user.uid
    const [vacs, placements] = await Promise.all([
      getVacanciesByIndustry(uid),
      getPlacementsByIndustry(uid)
    ])
    vacancies.value = vacs.sort((a, b) => b.createdAt - a.createdAt)
    placements.forEach(p => {
      applicationCounts.value[p.vacancyId] = (applicationCounts.value[p.vacancyId] || 0) + 1
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.vacancies-list { display: flex; flex-direction: column; gap: 16px; }
.vac-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; }
.vac-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
.vac-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.vac-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.78rem; color: var(--text-muted); }
.vac-desc { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
.vac-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.vac-stats { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--text-muted); }
</style>
