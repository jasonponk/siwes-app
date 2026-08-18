<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>My Applications</h1>
            <p class="page-sub">Track all your SIWES placement applications</p>
          </div>
        </div>

        <!-- Status Tabs -->
        <div class="status-tabs">
          <button v-for="tab in tabs" :key="tab.value"
            class="tab-btn" :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="tab-count">{{ countByStatus(tab.value) }}</span>
          </button>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px">
          <div class="loader"></div>
        </div>

        <div v-else-if="!filteredApps.length" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No applications here</h3>
          <p>Go to Recommendations to find and apply to industries.</p>
          <router-link to="/student/recommendations" class="btn btn-primary" style="margin-top:16px">Browse Recommendations</router-link>
        </div>

        <div v-else class="apps-list">
          <div v-for="app in filteredApps" :key="app.id" class="app-card">
            <div class="app-card-left">
              <div class="app-company-avatar">{{ (app.industryName || 'I')[0] }}</div>
              <div>
                <div class="app-company-name">{{ app.industryName || 'Unknown Industry' }}</div>
                <div class="app-vacancy-title">{{ app.vacancyTitle || 'SIWES Placement' }}</div>
                <div class="app-meta">
                  <span>📍 {{ app.location || 'N/A' }}</span>
                  <span>📅 Applied {{ formatDate(app.appliedAt) }}</span>
                </div>
              </div>
            </div>
            <div class="app-card-right">
              <span :class="statusClass(app.status)" class="badge">
                {{ statusLabel(app.status) }}
              </span>
              <div v-if="app.updatedAt" class="app-updated">
                Updated {{ formatDate(app.updatedAt) }}
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
import { getPlacementsByStudent, getAllIndustries, getAllVacancies } from '@/firebase/services'

const authStore = useAuthStore()
const loading = ref(true)
const applications = ref([])
const activeTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' }
]

const countByStatus = (status) => {
  if (status === 'all') return applications.value.length
  return applications.value.filter(a => a.status === status || (status === 'accepted' && a.status === 'approved')).length
}

const filteredApps = computed(() => {
  if (activeTab.value === 'all') return applications.value
  return applications.value.filter(a =>
    a.status === activeTab.value ||
    (activeTab.value === 'accepted' && a.status === 'approved')
  )
})

const statusLabel = (s) => ({ pending: 'Pending', accepted: 'Accepted', approved: 'Approved', rejected: 'Rejected' }[s] || s)
const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', approved: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

onMounted(async () => {
  try {
    const uid = authStore.user.uid
    const [placements, industriesArr, vacanciesArr] = await Promise.all([
      getPlacementsByStudent(uid), getAllIndustries(), getAllVacancies()
    ])
    const industriesMap = Object.fromEntries(industriesArr.map(i => [i.uid, i]))
    const vacanciesMap = Object.fromEntries(vacanciesArr.map(v => [v.id, v]))
    applications.value = placements.sort((a, b) => b.appliedAt - a.appliedAt).map(p => ({
      ...p,
      industryName: industriesMap[p.industryUid]?.companyName || 'Unknown',
      vacancyTitle: vacanciesMap[p.vacancyId]?.title || 'SIWES Placement',
      location: vacanciesMap[p.vacancyId]?.location || industriesMap[p.industryUid]?.location
    }))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }

.status-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--surface-3); border-radius: var(--radius-sm); padding: 4px; width: fit-content; }
.tab-btn { padding: 7px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-family: var(--font-body); background: transparent; color: var(--text-muted); display: flex; align-items: center; gap: 6px; transition: all var(--transition); }
.tab-btn.active { background: var(--surface); color: var(--primary); font-weight: 600; box-shadow: var(--shadow-sm); }
.tab-count { background: var(--surface-3); border-radius: 99px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700; }
.tab-btn.active .tab-count { background: rgba(15,76,129,0.1); color: var(--primary); }

.apps-list { display: flex; flex-direction: column; gap: 12px; }
.app-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; transition: all var(--transition); }
.app-card:hover { box-shadow: var(--shadow-sm); border-color: var(--primary); }
.app-card-left { display: flex; gap: 14px; align-items: flex-start; }
.app-company-avatar { width: 44px; height: 44px; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0; }
.app-company-name { font-weight: 600; font-size: 1rem; }
.app-vacancy-title { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; }
.app-meta { display: flex; gap: 12px; margin-top: 6px; font-size: 0.78rem; color: var(--text-muted); flex-wrap: wrap; }
.app-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.app-updated { font-size: 0.75rem; color: var(--text-muted); }
</style>
