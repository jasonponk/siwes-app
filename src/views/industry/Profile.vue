<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Company Profile</h1>
            <p class="page-sub">Keep your profile updated to attract the right students</p>
          </div>
        </div>

        <div v-if="success" class="alert alert-success" style="margin-bottom:16px">Profile updated successfully!</div>
        <div v-if="error" class="alert alert-error" style="margin-bottom:16px">{{ error }}</div>

        <form @submit.prevent="handleSave">
          <div class="grid-2">
            <div class="card">
              <div class="card-header"><span class="card-title">Company Information</span></div>
              <div class="form-group">
                <label class="form-label">Company Name</label>
                <input v-model="form.companyName" type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">Industry Category</label>
                <select v-model="form.category" class="form-control" required>
                  <option value="">Select Category</option>
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Company Location</label>
                <input v-model="form.location" type="text" class="form-control" placeholder="e.g. Lagos, Nigeria" />
              </div>
              <div class="form-group">
                <label class="form-label">Website</label>
                <input v-model="form.website" type="url" class="form-control" placeholder="https://..." />
              </div>
              <div class="form-group">
                <label class="form-label">Year Established</label>
                <input v-model="form.yearEstablished" type="number" class="form-control" placeholder="e.g. 2005" />
              </div>
              <div class="form-group">
                <label class="form-label">Company Size</label>
                <select v-model="form.companySize" class="form-control">
                  <option value="">Select</option>
                  <option>1–10 employees</option>
                  <option>11–50 employees</option>
                  <option>51–200 employees</option>
                  <option>201–500 employees</option>
                  <option>500+ employees</option>
                </select>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><span class="card-title">Contact Information</span></div>
              <div class="form-group">
                <label class="form-label">Contact Person</label>
                <input v-model="form.contactPerson" type="text" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input :value="authStore.user?.email" type="email" class="form-control" disabled />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input v-model="form.phone" type="tel" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <textarea v-model="form.address" class="form-control" rows="3" placeholder="Full company address..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">RC Number (CAC)</label>
                <input v-model="form.rcNumber" type="text" class="form-control" placeholder="e.g. RC123456" />
              </div>
            </div>

            <div class="card" style="grid-column: 1 / -1">
              <div class="card-header"><span class="card-title">About the Company</span></div>
              <div class="form-group">
                <label class="form-label">Company Description</label>
                <textarea v-model="form.description" class="form-control" rows="4" placeholder="Describe your company, its mission, and what makes it a great place for SIWES students..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Areas of Work / Departments</label>
                <TagsInput v-model="form.departments" placeholder="e.g. Software, Finance, Operations..." />
              </div>
              <div class="form-group">
                <label class="form-label">Common Skills Used</label>
                <TagsInput v-model="form.commonSkills" placeholder="e.g. AutoCAD, Python, Excel..." />
              </div>
            </div>
          </div>

          <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="saving">
              <span v-if="saving" class="loader" style="width:18px;height:18px;border-width:2px"></span>
              <span v-else>💾 Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import TagsInput from '@/components/TagsInput.vue'
import { useAuthStore } from '@/store/auth'
import { updateIndustryProfile } from '@/firebase/services'

const authStore = useAuthStore()
const saving = ref(false)
const success = ref(false)
const error = ref('')

const categories = [
  'ICT / Software', 'Banking / Finance', 'Oil & Gas', 'Manufacturing',
  'Healthcare', 'Telecommunications', 'Construction', 'Agriculture',
  'Media / Broadcasting', 'Government / Public Sector', 'NGO / Non-profit',
  'Pharmaceuticals', 'Automotive', 'Energy', 'Retail / Commerce',
  'Logistics', 'Education', 'Consulting', 'Other'
]

const form = ref({
  companyName: '', category: '', location: '', website: '',
  yearEstablished: '', companySize: '', contactPerson: '',
  phone: '', address: '', rcNumber: '',
  description: '', departments: [], commonSkills: []
})

onMounted(() => {
  const p = authStore.profile || {}
  Object.keys(form.value).forEach(k => {
    if (p[k] !== undefined) form.value[k] = p[k]
  })
  if (!form.value.departments) form.value.departments = []
  if (!form.value.commonSkills) form.value.commonSkills = []
})

const handleSave = async () => {
  error.value = ''; success.value = false; saving.value = true
  try {
    await updateIndustryProfile(authStore.user.uid, form.value)
    await authStore.refreshProfile()
    success.value = true
    setTimeout(() => success.value = false, 3000)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
</style>
