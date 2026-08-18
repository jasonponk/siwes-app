<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>All Students</h1>
            <p class="page-sub">{{ students.length }} registered student(s)</p>
          </div>
          <div style="display:flex; gap:8px">
            <input v-model="search" type="text" class="form-control" placeholder="Search students..." style="width:220px" />
          </div>
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>
        <div v-else-if="!filteredStudents.length" class="empty-state">
          <div class="empty-icon">🎓</div>
          <h3>No students found</h3>
        </div>
        <div v-else class="card" style="padding:0; overflow:hidden">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Institution</th>
                <th>Level</th>
                <th>Skills</th>
                <th>Applications</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filteredStudents" :key="s.uid" style="cursor:pointer" @click="viewStudent(s)">
                <td>
                  <div style="display:flex; align-items:center; gap:10px">
                    <div class="s-avatar">{{ (s.fullName || 'S')[0] }}</div>
                    <div>
                      <div style="font-weight:500; font-size:0.88rem">{{ s.fullName || '—' }}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted)">{{ s.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ s.department || '—' }}</td>
                <td>{{ s.institution || '—' }}</td>
                <td>{{ s.level || '—' }}</td>
                <td>{{ (s.skills || []).length }} skill(s)</td>
                <td>{{ applicationCounts[s.uid] || 0 }}</td>
                <td>
                  <span :class="applicationCounts[s.uid] ? 'badge-success' : 'badge-neutral'" class="badge">
                    {{ applicationCounts[s.uid] ? 'Active' : 'No Apps' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Student Detail Modal -->
        <div v-if="selectedStudent" class="modal-overlay" @click.self="selectedStudent = null">
          <div class="modal" style="max-width:560px">
            <div class="modal-header">
              <h3>Student Details</h3>
              <button class="modal-close" @click="selectedStudent = null">×</button>
            </div>
            <div class="modal-body">
              <div class="student-profile-header">
                <div class="s-big-avatar">{{ (selectedStudent.fullName || 'S')[0] }}</div>
                <div>
                  <div style="font-size:1.2rem; font-weight:700">{{ selectedStudent.fullName }}</div>
                  <div style="color:var(--text-muted); font-size:0.88rem">{{ selectedStudent.department }}</div>
                  <div style="color:var(--text-muted); font-size:0.88rem">{{ selectedStudent.institution }}</div>
                </div>
              </div>
              <div class="grid-2" style="margin-top:20px">
                <div class="info-item"><div class="info-label">Matric No.</div><div>{{ selectedStudent.matricNumber || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Level</div><div>{{ selectedStudent.level || '—' }}</div></div>
                <div class="info-item"><div class="info-label">CGPA</div><div>{{ selectedStudent.cgpa || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div>{{ selectedStudent.phone || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Location Pref.</div><div>{{ selectedStudent.preferredLocation || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Email</div><div>{{ selectedStudent.email || '—' }}</div></div>
              </div>
              <div v-if="selectedStudent.skills?.length" style="margin-top:16px">
                <div class="info-label" style="margin-bottom:8px">Skills</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px">
                  <span v-for="sk in selectedStudent.skills" :key="sk" class="tag">{{ sk }}</span>
                </div>
              </div>
              <div v-if="selectedStudent.interests?.length" style="margin-top:12px">
                <div class="info-label" style="margin-bottom:8px">Interests</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px">
                  <span v-for="i in selectedStudent.interests" :key="i" class="tag">{{ i }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="selectedStudent = null">Close</button>
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
import { getAllStudents, getAllPlacements } from '@/firebase/services'

const loading = ref(true)
const students = ref([])
const applicationCounts = ref({})
const search = ref('')
const selectedStudent = ref(null)

const filteredStudents = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return students.value
  return students.value.filter(s =>
    (s.fullName || '').toLowerCase().includes(q) ||
    (s.department || '').toLowerCase().includes(q) ||
    (s.institution || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q)
  )
})

const viewStudent = (s) => { selectedStudent.value = s }

onMounted(async () => {
  try {
    const [allStudents, placements] = await Promise.all([getAllStudents(), getAllPlacements()])
    students.value = allStudents.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    placements.forEach(p => {
      applicationCounts.value[p.studentUid] = (applicationCounts.value[p.studentUid] || 0) + 1
    })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.s-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; color: #fff; flex-shrink: 0; }
.s-big-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.student-profile-header { display: flex; gap: 16px; align-items: center; }
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
</style>
