<template>
  <div class="auth-page">
    <div class="auth-sidebar">
      <div class="auth-brand">
        <div style="font-size:3rem; margin-bottom:16px">🎓</div>
        <h2>Join SIWES Portal</h2>
        <p>Register as a student or industry representative to get started with intelligent placement matching.</p>
      </div>
      <div class="role-info">
        <div v-for="r in roleDescriptions" :key="r.role" class="role-desc">
          <div class="role-desc-icon">{{ r.icon }}</div>
          <div>
            <strong>{{ r.title }}</strong>
            <p>{{ r.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-main">
      <div class="auth-card fade-in">
        <router-link to="/" class="back-link">← Back to Home</router-link>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-sub">Select your role to get started</p>

        <!-- Role Selection -->
        <div class="role-selector" v-if="step === 1">
          <div
            v-for="role in roles"
            :key="role.value"
            class="role-option"
            :class="{ selected: form.role === role.value }"
            @click="form.role = role.value"
          >
            <span class="role-option-icon">{{ role.icon }}</span>
            <div>
              <strong>{{ role.label }}</strong>
              <small>{{ role.desc }}</small>
            </div>
          </div>
          <button class="btn btn-primary btn-block btn-lg" :disabled="!form.role" @click="step = 2">
            Continue →
          </button>
        </div>

        <!-- Form -->
        <form v-if="step === 2" @submit.prevent="handleRegister">
          <div v-if="error" class="alert alert-error" style="margin-bottom:16px">{{ error }}</div>

          <!-- Common fields -->
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input v-model="form.password" type="password" class="form-control" placeholder="Minimum 6 characters" required minlength="6" />
          </div>

          <!-- Student fields -->
          <template v-if="form.role === 'student'">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input v-model="form.fullName" type="text" class="form-control" placeholder="e.g. John Doe" required />
            </div>
            <div class="form-group">
              <label class="form-label">Matric Number</label>
              <input v-model="form.matricNumber" type="text" class="form-control" placeholder="e.g. CSC/2020/001" required />
            </div>
            <div class="form-group">
              <label class="form-label">Institution</label>
              <input v-model="form.institution" type="text" class="form-control" placeholder="e.g. University of Lagos" required />
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <select v-model="form.department" class="form-control" required>
                <option value="">Select Department</option>
                <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Level</label>
              <select v-model="form.level" class="form-control" required>
                <option value="">Select Level</option>
                <option>200 Level</option><option>300 Level</option>
                <option>400 Level</option><option>500 Level</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input v-model="form.phone" type="tel" class="form-control" placeholder="+234 8XX XXXXXXX" />
            </div>
          </template>

          <!-- Industry fields -->
          <template v-if="form.role === 'industry'">
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input v-model="form.companyName" type="text" class="form-control" placeholder="e.g. Dangote Industries" required />
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
              <input v-model="form.location" type="text" class="form-control" placeholder="e.g. Lagos, Nigeria" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contact Person</label>
              <input v-model="form.contactPerson" type="text" class="form-control" placeholder="HR Manager Name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input v-model="form.phone" type="tel" class="form-control" placeholder="+234 8XX XXXXXXX" />
            </div>
          </template>

          <div style="display:flex; gap:12px">
            <button type="button" class="btn btn-ghost" @click="step = 1">← Back</button>
            <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
              <span v-if="loading" class="loader" style="width:18px; height:18px; border-width:2px"></span>
              <span v-else>Create Account</span>
            </button>
          </div>
        </form>

        <p class="auth-switch" v-if="step <= 2">
          Already have an account? <router-link to="/login">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const router = useRouter()
const step = ref(1)
const error = ref('')
const loading = ref(false)

const form = ref({
  role: '', email: '', password: '',
  fullName: '', matricNumber: '', institution: '', department: '', level: '', phone: '',
  companyName: '', category: '', location: '', contactPerson: ''
})

const roles = [
  { value: 'student', icon: '🎓', label: 'Student', desc: 'Find placement opportunities and get AI recommendations' },
  { value: 'industry', icon: '🏭', label: 'Industry', desc: 'Post vacancies and review student applications' }
]

const roleDescriptions = [
  { role: 'student', icon: '🎓', title: 'Students', desc: 'Get matched with industries that align with your academic discipline and skills.' },
  { role: 'industry', icon: '🏭', title: 'Industries', desc: 'Find qualified SIWES students that match your requirements.' }
]

const departments = [
  'Computer Science', 'Computer Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Accounting', 'Economics', 'Business Administration', 'Medicine',
  'Pharmacy', 'Microbiology', 'Agriculture', 'Mass Communication',
  'Law', 'Architecture', 'Environmental Science', 'Physics',
  'Statistics', 'Mathematics', 'Biochemistry', 'Geology', 'Other'
]

const categories = [
  'ICT / Software', 'Banking / Finance', 'Oil & Gas',
  'Manufacturing', 'Healthcare', 'Telecommunications',
  'Construction', 'Agriculture', 'Media / Broadcasting',
  'Government / Public Sector', 'NGO / Non-profit',
  'Pharmaceuticals', 'Automotive', 'Energy',
  'Retail / Commerce', 'Logistics', 'Other'
]

const handleRegister = async () => {
  error.value = ''
  loading.value = true
  try {
    const { role, email, password, ...profileData } = form.value
    await authStore.register(email, password, role, profileData)
    if (role === 'student') router.push({ name: 'student-dashboard' })
    else if (role === 'industry') router.push({ name: 'industry-dashboard' })
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.'
    }
    error.value = msgs[e.code] || e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }
.auth-sidebar {
  width: 400px; flex-shrink: 0;
  background: linear-gradient(160deg, var(--primary-dark), var(--primary));
  padding: 60px 40px; display: flex; flex-direction: column;
  justify-content: center; gap: 40px;
}
.auth-brand h2 { color: #fff; font-size: 1.6rem; margin-bottom: 12px; }
.auth-brand p { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.7; }
.role-info { display: flex; flex-direction: column; gap: 20px; }
.role-desc { display: flex; gap: 12px; }
.role-desc-icon { font-size: 1.6rem; }
.role-desc strong { color: #fff; font-size: 0.9rem; }
.role-desc p { color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 4px; }

.auth-main {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 40px 24px; background: var(--surface-2); overflow-y: auto;
}
.auth-card { width: 100%; max-width: 460px; }
.back-link { font-size: 0.85rem; color: var(--text-muted); display: inline-block; margin-bottom: 20px; }
.auth-title { font-size: 1.8rem; margin-bottom: 6px; }
.auth-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 28px; }

.role-selector { display: flex; flex-direction: column; gap: 12px; }
.role-option {
  display: flex; align-items: center; gap: 14px;
  padding: 16px; border-radius: var(--radius);
  border: 2px solid var(--border); cursor: pointer;
  transition: all var(--transition); background: var(--surface);
}
.role-option:hover { border-color: var(--primary); }
.role-option.selected { border-color: var(--primary); background: rgba(15,76,129,0.04); }
.role-option-icon { font-size: 2rem; }
.role-option strong { display: block; font-size: 0.95rem; margin-bottom: 2px; }
.role-option small { font-size: 0.8rem; color: var(--text-muted); }

.auth-switch { text-align: center; font-size: 0.88rem; color: var(--text-muted); margin-top: 20px; }

@media (max-width: 800px) {
  .auth-sidebar { display: none; }
}
</style>
