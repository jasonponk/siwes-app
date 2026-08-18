<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p class="page-sub">Placement statistics and exportable reports</p>
          </div>
          <button class="btn btn-primary" @click="exportCSV">⬇️ Export CSV Report</button>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>

        <div v-else>
          <!-- Summary Cards -->
          <div class="grid-4" style="margin-bottom:28px">
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(15,76,129,0.1)">📊</div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.totalApplications }}</div>
                <div class="stat-label">Total Applications</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(39,174,96,0.1)">✅</div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.accepted }}</div>
                <div class="stat-label">Accepted</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(231,76,60,0.1)">❌</div>
              <div class="stat-info">
                <div class="stat-value">{{ summary.rejected }}</div>
                <div class="stat-label">Rejected</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background:rgba(243,156,18,0.1)">📈</div>
              <div class="stat-info">
                <div class="stat-value">{{ placementRate }}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
            </div>
          </div>

          <div class="grid-2" style="margin-bottom:24px">
            <!-- Applications by Status -->
            <div class="card">
              <div class="card-header"><span class="card-title">Applications by Status</span></div>
              <div class="status-bars">
                <div v-for="item in statusBreakdown" :key="item.label" class="status-bar-item">
                  <div class="status-bar-label">
                    <span>{{ item.label }}</span>
                    <span class="status-bar-count">{{ item.count }}</span>
                  </div>
                  <div class="progress">
                    <div class="progress-bar" :style="{ width: item.pct + '%', background: item.color }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Industries -->
            <div class="card">
              <div class="card-header"><span class="card-title">Top Industries by Applications</span></div>
              <div v-if="!topIndustries.length" class="empty-state" style="padding:30px">
                <div class="empty-icon">🏭</div><h3>No data yet</h3>
              </div>
              <div v-else>
                <div v-for="(ind, i) in topIndustries" :key="ind.name" class="top-item">
                  <div class="top-rank">#{{ i + 1 }}</div>
                  <div class="top-info">
                    <div class="top-name">{{ ind.name }}</div>
                    <div class="progress" style="margin-top:4px">
                      <div class="progress-bar" :style="{ width: (ind.count / topIndustries[0].count * 100) + '%' }"></div>
                    </div>
                  </div>
                  <div class="top-count">{{ ind.count }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Departments -->
          <div class="card" style="margin-bottom:24px">
            <div class="card-header"><span class="card-title">Applications by Department</span></div>
            <div v-if="!deptBreakdown.length" class="empty-state" style="padding:30px">
              <div class="empty-icon">📚</div><h3>No data yet</h3>
            </div>
            <div v-else class="dept-grid">
              <div v-for="d in deptBreakdown" :key="d.dept" class="dept-item">
                <div class="dept-bar-wrap">
                  <div class="dept-bar" :style="{ height: (d.count / deptBreakdown[0].count * 100) + '%' }"></div>
                </div>
                <div class="dept-count">{{ d.count }}</div>
                <div class="dept-label">{{ d.dept.split(' ')[0] }}</div>
              </div>
            </div>
          </div>

          <!-- Full Report Table -->
          <div class="card" style="padding:0; overflow:hidden">
            <div class="card-header" style="padding:20px 24px">
              <span class="card-title">Placement Report Table</span>
              <span class="badge badge-info">{{ reportRows.length }} records</span>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Department</th>
                    <th>Institution</th>
                    <th>Industry</th>
                    <th>Vacancy</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in reportRows" :key="row.id">
                    <td>{{ idx + 1 }}</td>
                    <td>{{ row.studentName }}</td>
                    <td>{{ row.studentDept }}</td>
                    <td>{{ row.studentInstitution }}</td>
                    <td>{{ row.industryName }}</td>
                    <td>{{ row.vacancyTitle }}</td>
                    <td>{{ formatDate(row.appliedAt) }}</td>
                    <td><span :class="statusClass(row.status)" class="badge">{{ row.status }}</span></td>
                  </tr>
                </tbody>
              </table>
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
import { getAllPlacements, getAllStudents, getAllIndustries, getAllVacancies } from '@/firebase/services'

const loading = ref(true)
const reportRows = ref([])

const summary = computed(() => ({
  totalApplications: reportRows.value.length,
  accepted: reportRows.value.filter(r => ['accepted', 'approved'].includes(r.status)).length,
  rejected: reportRows.value.filter(r => r.status === 'rejected').length,
  pending: reportRows.value.filter(r => r.status === 'pending').length
}))

const placementRate = computed(() => {
  if (!summary.value.totalApplications) return 0
  return Math.round((summary.value.accepted / summary.value.totalApplications) * 100)
})

const statusBreakdown = computed(() => {
  const total = reportRows.value.length || 1
  return [
    { label: 'Accepted', count: summary.value.accepted, color: 'var(--success)', pct: Math.round(summary.value.accepted / total * 100) },
    { label: 'Pending', count: summary.value.pending, color: 'var(--warning)', pct: Math.round(summary.value.pending / total * 100) },
    { label: 'Rejected', count: summary.value.rejected, color: 'var(--danger)', pct: Math.round(summary.value.rejected / total * 100) }
  ]
})

const topIndustries = computed(() => {
  const counts = {}
  reportRows.value.forEach(r => { counts[r.industryName] = (counts[r.industryName] || 0) + 1 })
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)
})

const deptBreakdown = computed(() => {
  const counts = {}
  reportRows.value.forEach(r => { if (r.studentDept) counts[r.studentDept] = (counts[r.studentDept] || 0) + 1 })
  return Object.entries(counts).map(([dept, count]) => ({ dept, count })).sort((a, b) => b.count - a.count).slice(0, 8)
})

const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', approved: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const exportCSV = () => {
  const headers = ['#', 'Student Name', 'Department', 'Institution', 'Industry', 'Vacancy', 'Date Applied', 'Status']
  const rows = reportRows.value.map((r, i) => [
    i + 1, r.studentName, r.studentDept, r.studentInstitution,
    r.industryName, r.vacancyTitle, formatDate(r.appliedAt), r.status
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `siwes-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    const [placements, students, industries, vacancies] = await Promise.all([
      getAllPlacements(), getAllStudents(), getAllIndustries(), getAllVacancies()
    ])
    const studentsMap = Object.fromEntries(students.map(s => [s.uid, s]))
    const industriesMap = Object.fromEntries(industries.map(i => [i.uid, i]))
    const vacanciesMap = Object.fromEntries(vacancies.map(v => [v.id, v]))

    reportRows.value = placements.sort((a, b) => b.appliedAt - a.appliedAt).map(p => ({
      ...p,
      studentName: studentsMap[p.studentUid]?.fullName || 'Unknown',
      studentDept: studentsMap[p.studentUid]?.department || '—',
      studentInstitution: studentsMap[p.studentUid]?.institution || '—',
      industryName: industriesMap[p.industryUid]?.companyName || 'Unknown',
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
.status-bars { display: flex; flex-direction: column; gap: 16px; }
.status-bar-item {}
.status-bar-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.88rem; }
.status-bar-count { font-weight: 700; }
.top-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.top-item:last-child { border-bottom: none; }
.top-rank { font-family: var(--font-display); font-size: 1rem; font-weight: 800; color: var(--text-muted); width: 28px; text-align: center; }
.top-info { flex: 1; }
.top-name { font-size: 0.88rem; font-weight: 500; margin-bottom: 4px; }
.top-count { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--primary); }
.dept-grid { display: flex; align-items: flex-end; gap: 16px; padding: 16px 0 8px; overflow-x: auto; }
.dept-item { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 60px; }
.dept-bar-wrap { height: 100px; display: flex; align-items: flex-end; width: 32px; background: var(--surface-3); border-radius: 4px 4px 0 0; overflow: hidden; }
.dept-bar { width: 100%; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--primary), var(--accent)); transition: height 0.5s ease; }
.dept-count { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; }
.dept-label { font-size: 0.72rem; color: var(--text-muted); text-align: center; max-width: 60px; word-break: break-word; }
</style>
