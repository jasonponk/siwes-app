<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>All Placements</h1>
            <p class="page-sub">Monitor and manage all student placement applications</p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center">
            <select v-model="filterStatus" class="form-control" style="width:140px">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <input v-model="search" type="text" class="form-control" placeholder="Search..." style="width:200px" />
          </div>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>
        <div v-else-if="!filteredPlacements.length" class="empty-state">
          <div class="empty-icon">🔗</div>
          <h3>No placements found</h3>
        </div>
        <div v-else class="card" style="padding:0; overflow:hidden">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Industry</th>
                <th>Vacancy</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredPlacements" :key="p.id">
                <td>
                  <div style="font-weight:500; font-size:0.88rem">{{ p.studentName }}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted)">{{ p.studentEmail }}</div>
                </td>
                <td>{{ p.studentDept || '—' }}</td>
                <td>{{ p.industryName }}</td>
                <td>{{ p.vacancyTitle }}</td>
                <td>{{ formatDate(p.appliedAt) }}</td>
                <td><span :class="statusClass(p.status)" class="badge">{{ p.status }}</span></td>
                <td>
                  <div style="display:flex; gap:6px; flex-wrap:wrap">
                    <button v-if="p.status !== 'accepted'" class="btn btn-accent btn-sm" @click="setStatus(p, 'accepted')">Accept</button>
                    <button v-if="p.status !== 'rejected'" class="btn btn-danger btn-sm" @click="setStatus(p, 'rejected')">Reject</button>
                    <button v-if="p.status !== 'pending'" class="btn btn-ghost btn-sm" @click="setStatus(p, 'pending')">Reset</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { getAllPlacements, getAllStudents, getAllIndustries, getAllVacancies, updatePlacementStatus, addNotification } from '@/firebase/services'

const loading = ref(true)
const placements = ref([])
const search = ref('')
const filterStatus = ref('all')

const filteredPlacements = computed(() => {
  let result = placements.value
  if (filterStatus.value !== 'all') result = result.filter(p => p.status === filterStatus.value)
  const q = search.value.toLowerCase()
  if (q) result = result.filter(p =>
    (p.studentName || '').toLowerCase().includes(q) ||
    (p.industryName || '').toLowerCase().includes(q) ||
    (p.vacancyTitle || '').toLowerCase().includes(q)
  )
  return result
})

const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', approved: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const setStatus = async (p, status) => {
  await updatePlacementStatus(p.id, status)
  p.status = status
  if (status === 'accepted') {
    await addNotification(p.studentUid, `🎉 Admin has confirmed your placement at ${p.industryName}!`, 'success')
  }
}

onMounted(async () => {
  try {
    const [allPlacements, students, industries, vacancies] = await Promise.all([
      getAllPlacements(), getAllStudents(), getAllIndustries(), getAllVacancies()
    ])
    const studentsMap = Object.fromEntries(students.map(s => [s.uid, s]))
    const industriesMap = Object.fromEntries(industries.map(i => [i.uid, i]))
    const vacanciesMap = Object.fromEntries(vacancies.map(v => [v.id, v]))

    placements.value = allPlacements.sort((a, b) => b.appliedAt - a.appliedAt).map(p => ({
      ...p,
      studentName: studentsMap[p.studentUid]?.fullName || 'Unknown',
      studentEmail: studentsMap[p.studentUid]?.email || '',
      studentDept: studentsMap[p.studentUid]?.department || '',
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
</style>
