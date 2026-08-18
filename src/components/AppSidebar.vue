<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">🎓</div>
      <div>
        <div class="logo-title">SIWES</div>
        <div class="logo-sub">Placement Portal</div>
      </div>
    </div>

    <!-- User info -->
    <div class="sidebar-user">
      <div class="user-avatar">{{ initials }}</div>
      <div class="user-info">
        <div class="user-name">{{ displayName }}</div>
        <div class="user-role">{{ roleLabel }}</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item-active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="sidebar-footer">
      <button class="nav-item logout-btn" @click="handleLogout">
        <span class="nav-icon">🚪</span>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => {
  const p = authStore.profile
  if (!p) return authStore.user?.email || 'User'
  return p.fullName || p.companyName || authStore.user?.email || 'User'
})

const initials = computed(() => {
  const name = displayName.value
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
})

const roleLabel = computed(() => {
  const map = { student: 'Student', industry: 'Industry Rep', admin: 'Administrator' }
  return map[authStore.userRole] || ''
})

const navItems = computed(() => {
  if (authStore.isStudent) return [
    { to: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/student/profile', icon: '👤', label: 'My Profile' },
    { to: '/student/recommendations', icon: '🎯', label: 'Recommendations' },
    { to: '/student/applications', icon: '📋', label: 'My Applications' }
  ]
  if (authStore.isIndustry) return [
    { to: '/industry/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/industry/profile', icon: '🏢', label: 'Company Profile' },
    { to: '/industry/vacancies', icon: '📌', label: 'Manage Vacancies' },
    { to: '/industry/applications', icon: '👥', label: 'Applications' }
  ]
  if (authStore.isAdmin) return [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/students', icon: '🎓', label: 'Students' },
    { to: '/admin/industries', icon: '🏭', label: 'Industries' },
    { to: '/admin/placements', icon: '🔗', label: 'Placements' },
    { to: '/admin/reports', icon: '📈', label: 'Reports' }
  ]
  return []
})

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar-logo {
  display: flex; align-items: center; gap: 12px;
  padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo-icon { font-size: 2rem; }
.logo-title {
  font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
  color: #fff; letter-spacing: 0.05em;
}
.logo-sub { font-size: 0.7rem; color: rgba(255,255,255,0.5); }

.sidebar-user {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 700;
  font-size: 0.85rem; color: #fff; flex-shrink: 0;
}
.user-name { color: #fff; font-size: 0.9rem; font-weight: 500; }
.user-role { color: rgba(255,255,255,0.4); font-size: 0.72rem; }

.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.6); font-size: 0.9rem;
  transition: all var(--transition); cursor: pointer;
  background: none; border: none; width: 100%; text-align: left;
  text-decoration: none;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item-active { background: rgba(255,255,255,0.15) !important; color: #fff !important; }
.nav-icon { font-size: 1.1rem; width: 20px; text-align: center; flex-shrink: 0; }

.sidebar-footer { padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
.logout-btn:hover { background: rgba(231,76,60,0.2) !important; color: #e74c3c !important; }
</style>
