<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>Student Applications</h1>
            <p class="page-sub">Review and manage applications from students</p>
          </div>
        </div>

        <div class="status-tabs">
          <button v-for="tab in tabs" :key="tab.value" class="tab-btn"
            :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
            {{ tab.label }} <span class="tab-count">{{ countByStatus(tab.value) }}</span>
          </button>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>

        <div v-else-if="!filteredApps.length" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No applications here</h3>
          <p>Applications from students will appear here once they apply to your vacancies.</p>
        </div>

        <div v-else class="apps-table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Institution</th>
                <th>Vacancy</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in filteredApps" :key="app.id">
                <td>
                  <div class="student-cell">
                    <div class="s-avatar">{{ (app.studentName || 'S')[0] }}</div>
                    <div>
                      <div class="s-name">{{ app.studentName }}</div>
                      <div class="s-email">{{ app.studentEmail }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ app.studentDept || '—' }}</td>
                <td>{{ app.studentInstitution || '—' }}</td>
                <td>{{ app.vacancyTitle || '—' }}</td>
                <td>{{ formatDate(app.appliedAt) }}</td>
                <td><span :class="statusClass(app.status)" class="badge">{{ app.status }}</span></td>
                <td>
                  <div style="display:flex; gap:6px; flex-wrap:wrap">
                    <button class="btn btn-ghost btn-sm" @click="viewStudent(app)">View</button>
                    <template v-if="app.status === 'pending'">
                      <button class="btn btn-accent btn-sm" @click="updateStatus(app, 'accepted')">Accept</button>
                      <button class="btn btn-danger btn-sm" @click="updateStatus(app, 'rejected')">Reject</button>
                    </template>
                    <span v-else class="text-muted" style="font-size:0.78rem; padding:4px 8px">{{ app.status }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Student Detail Modal -->
        <div v-if="selectedStudent" class="modal-overlay" @click.self="selectedStudent = null">
          <div class="modal" style="max-width:580px">
            <div class="modal-header">
              <h3>Student Profile</h3>
              <button class="modal-close" @click="selectedStudent = null">×</button>
            </div>
            <div class="modal-body">
              <div class="student-profile-header">
                <div class="s-big-avatar">{{ (selectedStudent.studentName || 'S')[0] }}</div>
                <div>
                  <div style="font-size:1.2rem; font-weight:700">{{ selectedStudent.studentName }}</div>
                  <div style="color:var(--text-muted); font-size:0.88rem">{{ selectedStudent.studentDept }}</div>
                  <div style="color:var(--text-muted); font-size:0.88rem">{{ selectedStudent.studentInstitution }}</div>
                </div>
              </div>
              <div class="grid-2" style="margin-top:20px">
                <div class="info-item"><div class="info-label">Matric No.</div><div>{{ selectedStudent.profile?.matricNumber || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Level</div><div>{{ selectedStudent.profile?.level || '—' }}</div></div>
                <div class="info-item"><div class="info-label">CGPA</div><div>{{ selectedStudent.profile?.cgpa || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div>{{ selectedStudent.profile?.phone || '—' }}</div></div>
              </div>
              <div style="margin-top:16px" v-if="selectedStudent.profile?.skills?.length">
                <div class="info-label" style="margin-bottom:8px">Skills</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px">
                  <span v-for="s in selectedStudent.profile.skills" :key="s" class="tag">{{ s }}</span>
                </div>
              </div>
              <div style="margin-top:16px" v-if="selectedStudent.profile?.bio">
                <div class="info-label" style="margin-bottom:6px">Bio</div>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6">{{ selectedStudent.profile.bio }}</p>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="selectedStudent = null">Close</button>
              <template v-if="selectedStudent.status === 'pending'">
                <button class="btn btn-danger" @click="updateStatus(selectedStudent, 'rejected'); selectedStudent = null">Reject</button>
                <button class="btn btn-accent" @click="updateStatus(selectedStudent, 'accepted'); selectedStudent = null">Accept Student</button>
              </template>
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
import { getPlacementsByIndustry, updatePlacementStatus, getAllStudents, getAllVacancies, addNotification } from '@/firebase/services'

const authStore = useAuthStore()
const loading = ref(true)
const applications = ref([])
const activeTab = ref('all')
const selectedStudent = ref(null)

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' }
]

const countByStatus = (s) => s === 'all' ? applications.value.length : applications.value.filter(a => a.status === s).length
const filteredApps = computed(() => activeTab.value === 'all' ? applications.value : applications.value.filter(a => a.status === activeTab.value))
const statusClass = (s) => ({ pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' }[s] || 'badge-neutral')
const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const viewStudent = (app) => { selectedStudent.value = app }

const updateStatus = async (app, status) => {
  await updatePlacementStatus(app.id, status)
  app.status = status
  const msg = status === 'accepted'
    ? `🎉 Your application to ${authStore.profile?.companyName} has been accepted!`
    : `Your application to ${authStore.profile?.companyName} was not successful this time.`
  await addNotification(app.studentUid, msg, status === 'accepted' ? 'success' : 'info')
}

onMounted(async () => {
  try {
    const uid = authStore.user.uid
    const [placements, students, vacancies] = await Promise.all([
      getPlacementsByIndustry(uid), getAllStudents(), getAllVacancies()
    ])
    const studentsMap = Object.fromEntries(students.map(s => [s.uid, s]))
    const vacanciesMap = Object.fromEntries(vacancies.map(v => [v.id, v]))
    applications.value = placements.sort((a, b) => b.appliedAt - a.appliedAt).map(p => {
      const student = studentsMap[p.studentUid] || {}
      return {
        ...p,
        studentName: student.fullName || 'Unknown',
        studentEmail: student.email || '',
        studentDept: student.department || '—',
        studentInstitution: student.institution || '—',
        vacancyTitle: vacanciesMap[p.vacancyId]?.title || '—',
        profile: student
      }
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.status-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--surface-3); border-radius: var(--radius-sm); padding: 4px; width: fit-content; }
.tab-btn { padding: 7px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-family: var(--font-body); background: transparent; color: var(--text-muted); display: flex; align-items: center; gap: 6px; transition: all var(--transition); }
.tab-btn.active { background: var(--surface); color: var(--primary); font-weight: 600; box-shadow: var(--shadow-sm); }
.tab-count { background: var(--surface-3); border-radius: 99px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700; }
.apps-table-wrap { padding: 0; overflow: hidden; }
.student-cell { display: flex; align-items: center; gap: 10px; }
.s-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0; }
.s-name { font-weight: 500; font-size: 0.88rem; }
.s-email { font-size: 0.75rem; color: var(--text-muted); }
.student-profile-header { display: flex; gap: 16px; align-items: center; }
.s-big-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
</style>
