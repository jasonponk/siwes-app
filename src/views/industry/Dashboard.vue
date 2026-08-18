<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Industry Dashboard</h1>
            <p class="page-sub">Welcome, {{ profile?.companyName || 'Company' }} 🏭</p>
          </div>
          <router-link to="/industry/vacancies" class="btn btn-primary">+ Post Vacancy</router-link>
        </div>

        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:28px">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(15,76,129,0.1)">📌</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.vacancies }}</div>
              <div class="stat-label">Active Vacancies</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(243,156,18,0.1)">📥</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">Pending Applications</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(39,174,96,0.1)">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accepted }}</div>
              <div class="stat-label">Accepted Students</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(231,76,60,0.1)">❌</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rejected }}</div>
              <div class="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <!-- Recent Applications -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Recent Applications</span>
              <router-link to="/industry/applications" class="btn btn-ghost btn-sm">View All</router-link>
            </div>
            <div v-if="loading" class="flex-center" style="padding:40px"><div class="loader"></div></div>
            <div v-else-if="!recentApps.length" class="empty-state" style="padding:30px 20px">
              <div class="empty-icon">📥</div>
              <h3>No applications yet</h3>
              <p>Post a vacancy to start receiving applications.</p>
            </div>
            <div v-else>
              <div v-for="app in recentApps" :key="app.id" class="app-item">
                <div>
                  <div class="app-company">{{ app.studentName || 'Student' }}</div>
                  <div class="app-date">{{ app.vacancyTitle }} · {{ formatDate(app.appliedAt) }}</div>
                </div>
                <div style="display:flex; gap:8px; align-items:center">
                  <span :class="statusClass(app.status)" class="badge">{{ app.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Info -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Company Profile</span>
              <router-link to="/industry/profile" class="btn btn-ghost btn-sm">Edit</router-link>
            </div>
            <div class="profile-info">
              <div class="company-avatar">{{ (profile?.companyName || 'I')[0] }}</div>
              <div>
                <div class="profile-name">{{ profile?.companyName || '—' }}</div>
                <div class="profile-dept">{{ profile?.category || '—' }}</div>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Location</div><div class="info-val">{{ profile?.location || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Contact</div><div class="info-val">{{ profile?.contactPerson || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Phone</div><div class="info-val">{{ profile?.phone || '—' }}</div></div>
              <div class="info-item"><div class="info-label">Website</div><div class="info-val">{{ profile?.website || '—' }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useAuthStore } from '@/store/auth'
import { getVacanciesByIndustry, getPlacementsByIndustry, getAllStudents, getAllVacancies } from '@/firebase/services'

const authStore = useAuthStore()
const profile = computed(() => authStore.profile)
const loading = ref(true)
const recentApps = ref([])
const stats = ref({ vacancies: 0, pending: 0, accepted: 0, rejected: 0 })

const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', approved: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

onMounted(async () => {
  try {
    const uid = authStore.user.uid
    const [vacancies, placements, students, allVacancies] = await Promise.all([
      getVacanciesByIndustry(uid),
      getPlacementsByIndustry(uid),
      getAllStudents(),
      getAllVacancies()
    ])
    const studentsMap = Object.fromEntries(students.map(s => [s.uid, s]))
    const vacanciesMap = Object.fromEntries(allVacancies.map(v => [v.id, v]))

    stats.value = {
      vacancies: vacancies.filter(v => v.status === 'open').length,
      pending: placements.filter(p => p.status === 'pending').length,
      accepted: placements.filter(p => ['accepted', 'approved'].includes(p.status)).length,
      rejected: placements.filter(p => p.status === 'rejected').length
    }

    recentApps.value = placements
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .slice(0, 5)
      .map(p => ({
        ...p,
        studentName: studentsMap[p.studentUid]?.fullName || 'Student',
        vacancyTitle: vacanciesMap[p.vacancyId]?.title || 'Placement'
      }))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.app-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
.app-item:last-child { border-bottom: none; }
.app-company { font-weight: 500; font-size: 0.9rem; }
.app-date { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.profile-info { display: flex; align-items: center; gap: 16px; padding: 12px 0 20px; }
.company-avatar { width: 56px; height: 56px; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.profile-name { font-weight: 600; font-size: 1rem; }
.profile-dept { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
.info-val { font-size: 0.88rem; margin-top: 2px; }
</style>
