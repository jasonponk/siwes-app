<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>All Industries</h1>
            <p class="page-sub">{{ industries.length }} registered industr{{ industries.length === 1 ? 'y' : 'ies' }}</p>
          </div>
          <input v-model="search" type="text" class="form-control" placeholder="Search industries..." style="width:220px" />
        </div>

        <div v-if="loading" class="flex-center" style="padding:60px"><div class="loader"></div></div>
        <div v-else-if="!filteredIndustries.length" class="empty-state">
          <div class="empty-icon">🏭</div>
          <h3>No industries found</h3>
        </div>
        <div v-else class="industries-grid">
          <div v-for="ind in filteredIndustries" :key="ind.uid" class="industry-card" @click="selectedIndustry = ind">
            <div class="ind-header">
              <div class="ind-avatar">{{ (ind.companyName || 'I')[0] }}</div>
              <div>
                <div class="ind-name">{{ ind.companyName }}</div>
                <div class="ind-cat">
                  <span class="badge badge-info">{{ ind.category || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="ind-info">
              <div class="info-row">📍 {{ ind.location || 'N/A' }}</div>
              <div class="info-row">👤 {{ ind.contactPerson || 'N/A' }}</div>
              <div class="info-row">📌 {{ vacancyCounts[ind.uid] || 0 }} vacanc{{ vacancyCounts[ind.uid] === 1 ? 'y' : 'ies' }}</div>
            </div>
            <div class="ind-footer">
              <span class="badge badge-success">{{ applicationCounts[ind.uid] || 0 }} application(s)</span>
            </div>
          </div>
        </div>

        <!-- Industry Detail Modal -->
        <div v-if="selectedIndustry" class="modal-overlay" @click.self="selectedIndustry = null">
          <div class="modal" style="max-width:560px">
            <div class="modal-header">
              <h3>Industry Details</h3>
              <button class="modal-close" @click="selectedIndustry = null">×</button>
            </div>
            <div class="modal-body">
              <div class="ind-modal-header">
                <div class="ind-big-avatar">{{ (selectedIndustry.companyName || 'I')[0] }}</div>
                <div>
                  <div style="font-size:1.2rem; font-weight:700">{{ selectedIndustry.companyName }}</div>
                  <div><span class="badge badge-info">{{ selectedIndustry.category }}</span></div>
                </div>
              </div>
              <div class="grid-2" style="margin-top:20px">
                <div class="info-item"><div class="info-label">Location</div><div>{{ selectedIndustry.location || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Contact</div><div>{{ selectedIndustry.contactPerson || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Phone</div><div>{{ selectedIndustry.phone || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Website</div><div>{{ selectedIndustry.website || '—' }}</div></div>
                <div class="info-item"><div class="info-label">Size</div><div>{{ selectedIndustry.companySize || '—' }}</div></div>
                <div class="info-item"><div class="info-label">RC Number</div><div>{{ selectedIndustry.rcNumber || '—' }}</div></div>
              </div>
              <div v-if="selectedIndustry.description" style="margin-top:16px">
                <div class="info-label" style="margin-bottom:6px">Description</div>
                <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.6">{{ selectedIndustry.description }}</p>
              </div>
              <div v-if="selectedIndustry.commonSkills?.length" style="margin-top:12px">
                <div class="info-label" style="margin-bottom:8px">Common Skills</div>
                <div style="display:flex; flex-wrap:wrap; gap:6px">
                  <span v-for="s in selectedIndustry.commonSkills" :key="s" class="tag">{{ s }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="selectedIndustry = null">Close</button>
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
import { getAllIndustries, getAllVacancies, getAllPlacements } from '@/firebase/services'

const loading = ref(true)
const industries = ref([])
const vacancyCounts = ref({})
const applicationCounts = ref({})
const search = ref('')
const selectedIndustry = ref(null)

const filteredIndustries = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return industries.value
  return industries.value.filter(i =>
    (i.companyName || '').toLowerCase().includes(q) ||
    (i.category || '').toLowerCase().includes(q) ||
    (i.location || '').toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const [inds, vacancies, placements] = await Promise.all([getAllIndustries(), getAllVacancies(), getAllPlacements()])
    industries.value = inds.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    vacancies.forEach(v => { vacancyCounts.value[v.industryUid] = (vacancyCounts.value[v.industryUid] || 0) + 1 })
    placements.forEach(p => { applicationCounts.value[p.industryUid] = (applicationCounts.value[p.industryUid] || 0) + 1 })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.industries-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.industry-card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; cursor: pointer; transition: all var(--transition); }
.industry-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--primary); }
.ind-header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
.ind-avatar { width: 48px; height: 48px; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.ind-name { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
.ind-info { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.info-row { font-size: 0.8rem; color: var(--text-muted); }
.ind-footer { padding-top: 12px; border-top: 1px solid var(--border); }
.ind-modal-header { display: flex; gap: 16px; align-items: center; }
.ind-big-avatar { width: 64px; height: 64px; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; }
</style>
