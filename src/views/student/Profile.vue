<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>My Profile</h1>
            <p class="page-sub">Keep your profile updated for better recommendations</p>
          </div>
        </div>

        <div v-if="success" class="alert alert-success" style="margin-bottom:16px">Profile updated successfully!</div>
        <div v-if="error" class="alert alert-error" style="margin-bottom:16px">{{ error }}</div>

        <form @submit.prevent="handleSave">
          <div class="grid-2">
            <!-- Personal Info -->
            <div class="card">
              <div class="card-header"><span class="card-title">Personal Information</span></div>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input v-model="form.fullName" type="text" class="form-control" required />
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
                <label class="form-label">Date of Birth</label>
                <input v-model="form.dob" type="date" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select v-model="form.gender" class="form-control">
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Prefer not to say</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">State of Origin</label>
                <input v-model="form.stateOfOrigin" type="text" class="form-control" />
              </div>
            </div>

            <!-- Academic Info -->
            <div class="card">
              <div class="card-header"><span class="card-title">Academic Information</span></div>
              <div class="form-group">
                <label class="form-label">Matric Number</label>
                <input v-model="form.matricNumber" type="text" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Institution</label>
                <input v-model="form.institution" type="text" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Department</label>
                <select v-model="form.department" class="form-control" required>
                  <option value="">Select Department</option>
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Faculty</label>
                <input v-model="form.faculty" type="text" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Current Level</label>
                <select v-model="form.level" class="form-control">
                  <option value="">Select Level</option>
                  <option>200 Level</option><option>300 Level</option>
                  <option>400 Level</option><option>500 Level</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">CGPA</label>
                <input v-model="form.cgpa" type="number" step="0.01" min="0" max="5" class="form-control" placeholder="e.g. 4.2" />
              </div>
            </div>

            <!-- Placement Preferences -->
            <div class="card">
              <div class="card-header"><span class="card-title">Placement Preferences</span></div>
              <div class="form-group">
                <label class="form-label">Preferred Location</label>
                <input v-model="form.preferredLocation" type="text" class="form-control" placeholder="e.g. Lagos, Abuja, any" />
              </div>
              <div class="form-group">
                <label class="form-label">Skills</label>
                <TagsInput v-model="form.skills" placeholder="e.g. Python, CAD, Accounting..." />
              </div>
              <div class="form-group">
                <label class="form-label">Career Interests</label>
                <TagsInput v-model="form.interests" placeholder="e.g. Software, Banking, Oil & Gas..." />
              </div>
              <div class="form-group">
                <label class="form-label">Languages</label>
                <TagsInput v-model="form.languages" placeholder="e.g. English, Yoruba..." />
              </div>
            </div>

            <!-- Bio & Additional -->
            <div class="card">
              <div class="card-header"><span class="card-title">About Me</span></div>
              <div class="form-group">
                <label class="form-label">Bio / Personal Statement</label>
                <textarea v-model="form.bio" class="form-control" rows="4" placeholder="Brief description about yourself, your goals and aspirations..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Certifications / Awards</label>
                <TagsInput v-model="form.certifications" placeholder="e.g. AWS Certified, CCNA..." />
              </div>
              <div class="form-group">
                <label class="form-label">LinkedIn / Portfolio URL</label>
                <input v-model="form.portfolioUrl" type="url" class="form-control" placeholder="https://..." />
              </div>
            </div>
          </div>

          <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end">
            <button type="button" class="btn btn-ghost" @click="resetForm">Reset Changes</button>
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
import { updateStudentProfile } from '@/firebase/services'

const authStore = useAuthStore()
const saving = ref(false)
const success = ref(false)
const error = ref('')

const departments = [
  'Computer Science', 'Computer Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Accounting', 'Economics', 'Business Administration', 'Medicine',
  'Pharmacy', 'Microbiology', 'Agriculture', 'Mass Communication',
  'Law', 'Architecture', 'Environmental Science', 'Physics',
  'Statistics', 'Mathematics', 'Biochemistry', 'Geology', 'Other'
]

const defaultForm = () => ({
  fullName: '', phone: '', dob: '', gender: '', stateOfOrigin: '',
  matricNumber: '', institution: '', department: '', faculty: '', level: '', cgpa: '',
  preferredLocation: '', skills: [], interests: [], languages: [],
  bio: '', certifications: [], portfolioUrl: ''
})

const form = ref(defaultForm())

const loadForm = () => {
  const p = authStore.profile || {}
  form.value = {
    fullName: p.fullName || '', phone: p.phone || '', dob: p.dob || '',
    gender: p.gender || '', stateOfOrigin: p.stateOfOrigin || '',
    matricNumber: p.matricNumber || '', institution: p.institution || '',
    department: p.department || '', faculty: p.faculty || '',
    level: p.level || '', cgpa: p.cgpa || '',
    preferredLocation: p.preferredLocation || '',
    skills: p.skills || [], interests: p.interests || [],
    languages: p.languages || [], bio: p.bio || '',
    certifications: p.certifications || [], portfolioUrl: p.portfolioUrl || ''
  }
}

const resetForm = () => loadForm()

const handleSave = async () => {
  error.value = ''; success.value = false; saving.value = true
  try {
    await updateStudentProfile(authStore.user.uid, form.value)
    await authStore.refreshProfile()
    success.value = true
    setTimeout(() => success.value = false, 3000)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(loadForm)
</script>

<style scoped>
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
</style>
