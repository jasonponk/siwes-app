<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p class="page-sub">SIWES Placement System — Administrative Overview</p>
          </div>
          <router-link to="/admin/reports" class="btn btn-primary">📈 View Reports</router-link>
        </div>

        <div class="grid-4" style="margin-bottom:28px">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(15,76,129,0.1)">🎓</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.students }}</div>
              <div class="stat-label">Total Students</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(0,184,148,0.1)">🏭</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.industries }}</div>
              <div class="stat-label">Industries</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(243,156,18,0.1)">📋</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.placements }}</div>
              <div class="stat-label">Total Applications</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(39,174,96,0.1)">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.accepted }}</div>
              <div class="stat-label">Placements Filled</div>
            </div>
          </div>
        </div>

        <div class="grid-3" style="margin-bottom:24px">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(243,156,18,0.1)">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">Pending Reviews</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(15,76,129,0.1)">📌</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.vacancies }}</div>
              <div class="stat-label">Open Vacancies</div>
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

        <!-- Placement rate bar -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <span class="card-title">Overall Placement Rate</span>
            <span class="badge badge-success">{{ placementRate }}%</span>
          </div>
          <div class="progress" style="height:12px; margin-bottom:8px">
            <div class="progress-bar" :style="{ width: placementRate + '%' }"></div>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted)">
            {{ stats.accepted }} students placed out of {{ stats.placements }} total applications
          </p>
        </div>

        <div class="grid-2">
          <!-- Recent Placements -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Recent Applications</span>
              <router-link to="/admin/placements" class="btn btn-ghost btn-sm">View All</router-link>
            </div>
            <div v-if="loading" class="flex-center" style="padding:40px"><div class="loader"></div></div>
            <div v-else-if="!recentPlacements.length" class="empty-state" style="padding:30px">
              <div class="empty-icon">📋</div><h3>No activity yet</h3>
            </div>
            <div v-else>
              <div v-for="p in recentPlacements" :key="p.id" class="app-item">
                <div>
                  <div class="app-company">{{ p.studentName }} → {{ p.industryName }}</div>
                  <div class="app-date">{{ formatDate(p.appliedAt) }}</div>
                </div>
                <span :class="statusClass(p.status)" class="badge">{{ p.status }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="card">
            <div class="card-header"><span class="card-title">Quick Actions</span></div>
            <div class="quick-links">
              <router-link to="/admin/students" class="quick-link">
                <span class="quick-icon">🎓</span>
                <div><strong>Manage Students</strong><p>View all registered students</p></div>
              </router-link>
              <router-link to="/admin/industries" class="quick-link">
                <span class="quick-icon">🏭</span>
                <div><strong>Manage Industries</strong><p>View all registered companies</p></div>
              </router-link>
              <router-link to="/admin/placements" class="quick-link">
                <span class="quick-icon">🔗</span>
                <div><strong>All Placements</strong><p>Monitor all applications</p></div>
              </router-link>
              <router-link to="/admin/reports" class="quick-link">
                <span class="quick-icon">📈</span>
                <div><strong>Generate Report</strong><p>Export placement analytics</p></div>
              </router-link>
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
import { getAllStudents, getAllIndustries, getAllPlacements, getAllVacancies } from '@/firebase/services'

const loading = ref(true)
const recentPlacements = ref([])
const stats = ref({ students: 0, industries: 0, placements: 0, accepted: 0, pending: 0, rejected: 0, vacancies: 0 })

const placementRate = computed(() => {
  if (!stats.value.placements) return 0
  return Math.round((stats.value.accepted / stats.value.placements) * 100)
})

const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', approved: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

onMounted(async () => {
  try {
    const [students, industries, placements, vacancies] = await Promise.all([
      getAllStudents(), getAllIndustries(), getAllPlacements(), getAllVacancies()
    ])
    const studentsMap = Object.fromEntries(students.map(s => [s.uid, s]))
    const industriesMap = Object.fromEntries(industries.map(i => [i.uid, i]))

    stats.value = {
      students: students.length,
      industries: industries.length,
      placements: placements.length,
      accepted: placements.filter(p => ['accepted', 'approved'].includes(p.status)).length,
      pending: placements.filter(p => p.status === 'pending').length,
      rejected: placements.filter(p => p.status === 'rejected').length,
      vacancies: vacancies.filter(v => v.status === 'open').length
    }

    recentPlacements.value = placements
      .sort((a, b) => b.appliedAt - a.appliedAt)
      .slice(0, 6)
      .map(p => ({
        ...p,
        studentName: studentsMap[p.studentUid]?.fullName || 'Student',
        industryName: industriesMap[p.industryUid]?.companyName || 'Industry'
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
.app-company { font-weight: 500; font-size: 0.88rem; }
.app-date { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.quick-links { display: flex; flex-direction: column; gap: 4px; }
.quick-link { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius-sm); transition: all var(--transition); text-decoration: none; color: var(--text); }
.quick-link:hover { background: var(--surface-2); color: var(--primary); }
.quick-icon { font-size: 1.6rem; width: 36px; text-align: center; }
.quick-link strong { font-size: 0.9rem; display: block; }
.quick-link p { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
</style>
