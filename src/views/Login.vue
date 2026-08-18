<template>
  <div class="auth-page">
    <div class="auth-sidebar">
      <div class="auth-brand">
        <div style="font-size:3rem; margin-bottom:16px">🎓</div>
        <h2>SIWES Placement Portal</h2>
        <p>Nigeria's intelligent student-industry matching platform for industrial training.</p>
      </div>
      <div class="auth-features">
        <div v-for="f in sideFeatures" :key="f" class="auth-feature">
          <span>✓</span> {{ f }}
        </div>
      </div>
    </div>

    <div class="auth-main">
      <div class="auth-card fade-in">
        <div class="auth-logo-mobile">🎓 SIWES Portal</div>
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-sub">Sign in to your account</p>

        <div v-if="error" class="alert alert-error" style="margin-bottom:16px">{{ error }}</div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="form-control" placeholder="••••••••" required />
            <button type="button" @click="showPass = !showPass" class="pass-toggle">
              {{ showPass ? 'Hide' : 'Show' }}
            </button>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <span v-if="loading" class="loader" style="width:18px; height:18px; border-width:2px"></span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="auth-divider"><span>Demo Accounts</span></div>
        <div class="demo-accounts">
          <div v-for="demo in demoAccounts" :key="demo.label" class="demo-btn" @click="fillDemo(demo)">
            <span class="demo-icon">{{ demo.icon }}</span>
            <div>
              <div class="demo-label">{{ demo.label }}</div>
              <div class="demo-email">{{ demo.email }}</div>
            </div>
          </div>
        </div>

        <p class="auth-switch">
          Don't have an account? <router-link to="/register">Register here</router-link>
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

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPass = ref(false)

const sideFeatures = [
  'Smart industry recommendations',
  'Automated placement matching',
  'Real-time application tracking',
  'Comprehensive analytics'
]

const demoAccounts = [
  { icon: '🎓', label: 'Student Demo', email: 'student@demo.com', password: 'demo1234' },
  { icon: '🏭', label: 'Industry Demo', email: 'industry@demo.com', password: 'demo1234' },
  { icon: '👨‍💼', label: 'Admin Demo', email: 'admin@demo.com', password: 'demo1234' }
]

const fillDemo = (demo) => {
  form.value.email = demo.email
  form.value.password = demo.password
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    const result = await authStore.login(form.value.email, form.value.password)
    const role = result.role || authStore.userRole
    if (role === 'student') router.push({ name: 'student-dashboard' })
    else if (role === 'industry') router.push({ name: 'industry-dashboard' })
    else if (role === 'admin') router.push({ name: 'admin-dashboard' })
    else router.push('/')
  } catch (e) {
    const msgs = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/too-many-requests': 'Too many attempts. Please try later.'
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
.auth-features { display: flex; flex-direction: column; gap: 12px; }
.auth-feature {
  color: rgba(255,255,255,0.8); font-size: 0.88rem;
  display: flex; gap: 10px; align-items: center;
}
.auth-feature span { color: var(--accent); font-weight: 700; }

.auth-main {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 40px 24px; background: var(--surface-2);
}
.auth-card { width: 100%; max-width: 420px; }
.auth-logo-mobile { display: none; font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-bottom: 24px; }
.auth-title { font-size: 1.8rem; margin-bottom: 6px; }
.auth-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 28px; }

.form-group { position: relative; }
.pass-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 0.8rem;
  padding: 4px 8px; margin-top: 12px;
}

.auth-divider {
  display: flex; align-items: center; gap: 12px; margin: 24px 0;
  color: var(--text-muted); font-size: 0.82rem;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

.demo-accounts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.demo-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); cursor: pointer;
  background: var(--surface); transition: all var(--transition);
}
.demo-btn:hover { border-color: var(--primary); background: var(--surface-3); }
.demo-icon { font-size: 1.4rem; }
.demo-label { font-size: 0.85rem; font-weight: 500; }
.demo-email { font-size: 0.75rem; color: var(--text-muted); }

.auth-switch { text-align: center; font-size: 0.88rem; color: var(--text-muted); }

@media (max-width: 800px) {
  .auth-sidebar { display: none; }
  .auth-logo-mobile { display: block; }
}
</style>
