<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1>Student Dashboard</h1>
            <p class="page-sub">Welcome back, {{ profile?.fullName || 'Student' }} 👋</p>
          </div>
          <router-link to="/student/recommendations" class="btn btn-primary">
            🎯 View Recommendations
          </router-link>
        </div>

        <!-- Stats -->
        <div class="grid-4" style="margin-bottom:28px">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(15,76,129,0.1)">🎯</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.recommendations }}</div>
              <div class="stat-label">Recommendations</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(243,156,18,0.1)">📋</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">Pending Applications</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(39,174,96,0.1)">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accepted }}</div>
              <div class="stat-label">Accepted</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(0,184,148,0.1)">🏭</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.industries }}</div>
              <div class="stat-label">Available Industries</div>
            </div>
          </div>
        </div>

        <!-- Profile Completion -->
        <div class="card" style="margin-bottom:24px" v-if="profileCompletion < 100">
          <div class="card-header">
            <span class="card-title">Complete Your Profile</span>
            <span class="badge badge-warning">{{ profileCompletion }}% Complete</span>
          </div>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:12px">
            A complete profile improves your recommendation accuracy. Please fill in your skills, interests, and preferred location.
          </p>
          <div class="progress" style="margin-bottom:12px">
            <div class="progress-bar" :style="{ width: profileCompletion + '%' }"></div>
          </div>
          <router-link to="/student/profile" class="btn btn-primary btn-sm">Update Profile</router-link>
        </div>

        <div class="grid-2">
          <!-- Recent Applications -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Recent Applications</span>
              <router-link to="/student/applications" class="btn btn-ghost btn-sm">View All</router-link>
            </div>
            <div v-if="loading" class="flex-center" style="padding:40px">
              <div class="loader"></div>
            </div>
            <div v-else-if="!recentApplications.length" class="empty-state" style="padding:40px 20px">
              <div class="empty-icon">📋</div>
              <h3>No applications yet</h3>
              <p>Browse recommendations and apply to industries.</p>
            </div>
            <div v-else>
              <div v-for="app in recentApplications" :key="app.id" class="app-item">
                <div>
                  <div class="app-company">{{ app.industryName || 'Industry' }}</div>
                  <div class="app-date">{{ formatDate(app.appliedAt) }}</div>
                </div>
                <span :class="statusClass(app.status)" class="badge">{{ app.status }}</span>
              </div>
            </div>
          </div>

          <!-- Profile Info -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">My Profile</span>
              <router-link to="/student/profile" class="btn btn-ghost btn-sm">Edit</router-link>
            </div>
            <div class="profile-info">
              <div class="profile-avatar">{{ initials }}</div>
              <div>
                <div class="profile-name">{{ profile?.fullName || '—' }}</div>
                <div class="profile-dept">{{ profile?.department || '—' }}</div>
              </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Institution</div>
                <div class="info-val">{{ profile?.institution || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Matric No</div>
                <div class="info-val">{{ profile?.matricNumber || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Level</div>
                <div class="info-val">{{ profile?.level || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Skills</div>
                <div class="info-val">{{ (profile?.skills || []).length }} listed</div>
              </div>
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
import { getAllVacancies, getAllIndustries, getPlacementsByStudent } from '@/firebase/services'
import { generateRecommendations } from '@/recommendation/engine'

const authStore = useAuthStore()
const profile = computed(() => authStore.profile)
const loading = ref(true)
const recentApplications = ref([])
const stats = ref({ recommendations: 0, pending: 0, accepted: 0, industries: 0 })

const initials = computed(() => {
  const name = profile.value?.fullName || ''
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?'
})

const profileCompletion = computed(() => {
  const p = profile.value
  if (!p) return 0
  const fields = ['fullName', 'department', 'institution', 'matricNumber', 'level', 'phone', 'skills', 'interests', 'preferredLocation', 'bio']
  const filled = fields.filter(f => {
    const v = p[f]
    return v && (Array.isArray(v) ? v.length > 0 : v !== '')
  })
  return Math.round((filled.length / fields.length) * 100)
})

const statusClass = (s) => ({
  pending: 'badge-warning', accepted: 'badge-success',
  rejected: 'badge-danger', approved: 'badge-success'
}[s] || 'badge-neutral')

const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

onMounted(async () => {
  try {
    const uid = authStore.user.uid
    const [vacancies, industriesArr, placements] = await Promise.all([
      getAllVacancies(),
      getAllIndustries(),
      getPlacementsByStudent(uid)
    ])

    const industriesMap = Object.fromEntries(industriesArr.map(i => [i.uid, i]))
    const recs = generateRecommendations(profile.value || {}, vacancies, industriesMap)

    stats.value = {
      recommendations: recs.length,
      pending: placements.filter(p => p.status === 'pending').length,
      accepted: placements.filter(p => ['accepted', 'approved'].includes(p.status)).length,
      industries: industriesArr.length
    }

    // Enrich applications with industry names
    recentApplications.value = placements
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .slice(0, 5)
      .map(p => ({ ...p, industryName: industriesMap[p.industryUid]?.companyName || 'Unknown' }))
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
.profile-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: #fff; }
.profile-name { font-weight: 600; font-size: 1rem; }
.profile-dept { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item {}
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
.info-val { font-size: 0.88rem; margin-top: 2px; }
</style>
