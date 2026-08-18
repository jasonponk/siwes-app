<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <div class="page-content fade-in">
        <div class="page-header">
          <div>
            <h1>🎯 Recommendations</h1>
            <p class="page-sub">Industries matched to your profile — ranked by compatibility score</p>
          </div>
          <div class="filter-controls">
            <select v-model="filter" class="form-control" style="width:160px">
              <option value="all">All Matches</option>
              <option value="excellent">Excellent (85%+)</option>
              <option value="good">Good (70%+)</option>
              <option value="fair">Fair (50%+)</option>
            </select>
            <button @click="loadRecommendations" class="btn btn-ghost btn-sm">🔄 Refresh</button>
          </div>
        </div>

        <!-- Profile warning -->
        <div v-if="!hasProfile" class="alert alert-warning" style="margin-bottom:20px">
          ⚠️ Your profile is incomplete. <router-link to="/student/profile">Complete your profile</router-link> for better recommendations.
        </div>

        <div v-if="loading" class="flex-center" style="padding:80px">
          <div style="text-align:center">
            <div class="loader" style="margin:0 auto 16px"></div>
            <p style="color:var(--text-muted)">Generating recommendations...</p>
          </div>
        </div>

        <div v-else-if="!filteredRecs.length" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No recommendations found</h3>
          <p>Update your profile with skills, department, and location preferences to get matched.</p>
          <router-link to="/student/profile" class="btn btn-primary" style="margin-top:16px">Update Profile</router-link>
        </div>

        <div v-else>
          <div class="rec-summary">
            <span>Showing <strong>{{ filteredRecs.length }}</strong> of <strong>{{ recommendations.length }}</strong> matches</span>
          </div>

          <div class="recs-grid">
            <div
              v-for="rec in filteredRecs"
              :key="rec.vacancy.id"
              class="rec-card"
              :class="{ applied: appliedVacancies.has(rec.vacancy.id) }"
            >
              <!-- Score Ring -->
              <div class="rec-header">
                <ScoreRing :score="rec.score" :size="72" />
                <div class="rec-match-info">
                  <div class="rec-match-label" :style="{ color: getMatchLabel(rec.score).color }">
                    {{ getMatchLabel(rec.score).label }}
                  </div>
                  <div class="rec-company">{{ rec.industry?.companyName || rec.vacancy.companyName }}</div>
                  <div class="rec-category">
                    <span class="badge badge-info">{{ rec.vacancy.category || rec.industry?.category }}</span>
                  </div>
                </div>
              </div>

              <!-- Vacancy details -->
              <div class="rec-details">
                <div class="rec-title">{{ rec.vacancy.title }}</div>
                <div class="rec-meta">
                  <span>📍 {{ rec.vacancy.location || rec.industry?.location || 'Not specified' }}</span>
                  <span>👥 {{ rec.vacancy.availableSlots || '?' }} slot(s)</span>
                  <span>📅 {{ formatDate(rec.vacancy.deadline) }}</span>
                </div>
                <p class="rec-desc">{{ (rec.vacancy.description || '').slice(0, 120) }}{{ rec.vacancy.description?.length > 120 ? '...' : '' }}</p>

                <!-- Score Breakdown -->
                <div class="score-breakdown">
                  <div class="breakdown-title">Match Breakdown</div>
                  <div v-for="(val, key) in rec.breakdown" :key="key" class="breakdown-item">
                    <span class="breakdown-label">{{ breakdownLabels[key] }}</span>
                    <div class="breakdown-bar-wrap">
                      <div class="breakdown-bar">
                        <div class="breakdown-fill" :style="{ width: val + '%', background: barColor(val) }"></div>
                      </div>
                      <span class="breakdown-pct">{{ val }}%</span>
                    </div>
                  </div>
                </div>

                <!-- Skills required -->
                <div v-if="rec.vacancy.requiredSkills?.length" class="rec-skills">
                  <div class="breakdown-title">Required Skills</div>
                  <div class="skills-tags">
                    <span v-for="skill in rec.vacancy.requiredSkills" :key="skill"
                      class="tag"
                      :class="{ 'tag-matched': isSkillMatched(skill) }"
                    >{{ skill }}</span>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div class="rec-actions">
                <button
                  v-if="appliedVacancies.has(rec.vacancy.id)"
                  class="btn btn-ghost btn-sm" disabled
                >✓ Applied</button>
                <button v-else @click="applyFor(rec)" class="btn btn-primary btn-sm" :disabled="applying === rec.vacancy.id">
                  <span v-if="applying === rec.vacancy.id" class="loader" style="width:14px;height:14px;border-width:2px"></span>
                  <span v-else>Apply Now</span>
                </button>
                <button @click="viewDetails(rec)" class="btn btn-ghost btn-sm">View Details</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Modal -->
        <div v-if="detailRec" class="modal-overlay" @click.self="detailRec = null">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ detailRec.vacancy.title }}</h3>
              <button class="modal-close" @click="detailRec = null">×</button>
            </div>
            <div class="modal-body">
              <div style="display:flex; gap:16px; align-items:center; margin-bottom:20px">
                <ScoreRing :score="detailRec.score" :size="64" />
                <div>
                  <div style="font-size:1.1rem; font-weight:600">{{ detailRec.industry?.companyName }}</div>
                  <div style="font-size:0.85rem; color:var(--text-muted)">{{ detailRec.industry?.location }}</div>
                </div>
              </div>
              <p style="margin-bottom:16px">{{ detailRec.vacancy.description }}</p>
              <div class="form-group">
                <label class="form-label">Required Skills</label>
                <div class="skills-tags">
                  <span v-for="s in (detailRec.vacancy.requiredSkills || [])" :key="s" class="tag">{{ s }}</span>
                </div>
              </div>
              <div class="grid-2">
                <div class="info-item"><div class="info-label">Location</div><div>{{ detailRec.vacancy.location }}</div></div>
                <div class="info-item"><div class="info-label">Available Slots</div><div>{{ detailRec.vacancy.availableSlots }}</div></div>
                <div class="info-item"><div class="info-label">Duration</div><div>{{ detailRec.vacancy.duration || 'Not specified' }}</div></div>
                <div class="info-item"><div class="info-label">Deadline</div><div>{{ formatDate(detailRec.vacancy.deadline) }}</div></div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="detailRec = null">Close</button>
              <button
                v-if="!appliedVacancies.has(detailRec.vacancy.id)"
                class="btn btn-primary"
                @click="applyFor(detailRec); detailRec = null"
              >Apply Now</button>
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
import ScoreRing from '@/components/ScoreRing.vue'
import { useAuthStore } from '@/store/auth'
import { getAllVacancies, getAllIndustries, getPlacementsByStudent, applyForPlacement, addNotification } from '@/firebase/services'
import { generateRecommendations, getMatchLabel } from '@/recommendation/engine'

const authStore = useAuthStore()
const loading = ref(true)
const applying = ref(null)
const recommendations = ref([])
const appliedVacancies = ref(new Set())
const detailRec = ref(null)
const filter = ref('all')

const breakdownLabels = { department: 'Department', skills: 'Skills', location: 'Location', interests: 'Interests' }

const hasProfile = computed(() => {
  const p = authStore.profile
  return p && p.department && (p.skills?.length > 0)
})

const filteredRecs = computed(() => {
  const minScore = { all: 0, excellent: 85, good: 70, fair: 50 }[filter.value]
  return recommendations.value.filter(r => r.score >= minScore)
})

const barColor = (val) => {
  if (val >= 80) return 'var(--success)'
  if (val >= 60) return 'var(--primary)'
  if (val >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

const isSkillMatched = (skill) => {
  const studentSkills = (authStore.profile?.skills || []).map(s => s.toLowerCase())
  return studentSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))
}

const formatDate = (ts) => {
  if (!ts) return 'N/A'
  return new Date(ts).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

const viewDetails = (rec) => { detailRec.value = rec }

const applyFor = async (rec) => {
  if (appliedVacancies.value.has(rec.vacancy.id)) return
  applying.value = rec.vacancy.id
  try {
    await applyForPlacement(authStore.user.uid, rec.vacancy.id, rec.vacancy.industryUid)
    appliedVacancies.value.add(rec.vacancy.id)
    await addNotification(authStore.user.uid, `Application submitted to ${rec.industry?.companyName}`, 'success')
    await addNotification(rec.vacancy.industryUid, `New application received from ${authStore.profile?.fullName || 'a student'}`, 'info')
  } catch (e) {
    alert(e.message)
  } finally {
    applying.value = null
  }
}

const loadRecommendations = async () => {
  loading.value = true
  try {
    const uid = authStore.user.uid
    const [vacancies, industriesArr, placements] = await Promise.all([
      getAllVacancies(), getAllIndustries(), getPlacementsByStudent(uid)
    ])
    const industriesMap = Object.fromEntries(industriesArr.map(i => [i.uid, i]))
    recommendations.value = generateRecommendations(authStore.profile || {}, vacancies, industriesMap)
    appliedVacancies.value = new Set(placements.map(p => p.vacancyId))
  } finally {
    loading.value = false
  }
}

onMounted(loadRecommendations)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.page-header h1 { font-size: 1.6rem; }
.page-sub { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
.filter-controls { display: flex; gap: 8px; align-items: center; }
.rec-summary { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px; }
.recs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; }

.rec-card {
  background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);
  padding: 20px; transition: all var(--transition); display: flex; flex-direction: column; gap: 16px;
}
.rec-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--primary); }
.rec-card.applied { opacity: 0.7; border-color: var(--success); }
.rec-header { display: flex; gap: 16px; align-items: flex-start; }
.rec-match-info { flex: 1; }
.rec-match-label { font-weight: 700; font-size: 0.85rem; margin-bottom: 4px; }
.rec-company { font-family: var(--font-display); font-size: 1rem; font-weight: 700; }
.rec-category { margin-top: 4px; }

.rec-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 8px; }
.rec-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px; }
.rec-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px; }

.score-breakdown { background: var(--surface-2); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px; }
.breakdown-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; }
.breakdown-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.breakdown-item:last-child { margin-bottom: 0; }
.breakdown-label { font-size: 0.78rem; width: 80px; flex-shrink: 0; text-transform: capitalize; }
.breakdown-bar-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }
.breakdown-bar { flex: 1; height: 6px; background: var(--surface-3); border-radius: 3px; overflow: hidden; }
.breakdown-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.breakdown-pct { font-size: 0.75rem; font-weight: 600; width: 32px; text-align: right; }

.rec-skills { margin-bottom: 4px; }
.skills-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.tag-matched { background: rgba(39,174,96,0.12) !important; color: var(--success) !important; border: 1px solid var(--success); }

.rec-actions { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border); margin-top: auto; }
.info-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700; margin-bottom: 2px; }
</style>
