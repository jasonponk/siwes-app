import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Lazy-loaded views
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const StudentDashboard = () => import('@/views/student/Dashboard.vue')
const StudentProfile = () => import('@/views/student/Profile.vue')
const Recommendations = () => import('@/views/student/Recommendations.vue')
const MyApplications = () => import('@/views/student/Applications.vue')
const IndustryDashboard = () => import('@/views/industry/Dashboard.vue')
const IndustryProfile = () => import('@/views/industry/Profile.vue')
const ManageVacancies = () => import('@/views/industry/Vacancies.vue')
const IndustryApplications = () => import('@/views/industry/Applications.vue')
const AdminDashboard = () => import('@/views/admin/Dashboard.vue')
const AdminStudents = () => import('@/views/admin/Students.vue')
const AdminIndustries = () => import('@/views/admin/Industries.vue')
const AdminPlacements = () => import('@/views/admin/Placements.vue')
const AdminReports = () => import('@/views/admin/Reports.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes = [
  { path: '/', component: Home, name: 'home' },
  { path: '/login', component: Login, name: 'login' },
  { path: '/register', component: Register, name: 'register' },
  // Student routes
  {
    path: '/student',
    meta: { requiresAuth: true, role: 'student' },
    children: [
      { path: 'dashboard', component: StudentDashboard, name: 'student-dashboard' },
      { path: 'profile', component: StudentProfile, name: 'student-profile' },
      { path: 'recommendations', component: Recommendations, name: 'recommendations' },
      { path: 'applications', component: MyApplications, name: 'student-applications' }
    ]
  },
  // Industry routes
  {
    path: '/industry',
    meta: { requiresAuth: true, role: 'industry' },
    children: [
      { path: 'dashboard', component: IndustryDashboard, name: 'industry-dashboard' },
      { path: 'profile', component: IndustryProfile, name: 'industry-profile' },
      { path: 'vacancies', component: ManageVacancies, name: 'industry-vacancies' },
      { path: 'applications', component: IndustryApplications, name: 'industry-applications' }
    ]
  },
  // Admin routes
  {
    path: '/admin',
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'dashboard', component: AdminDashboard, name: 'admin-dashboard' },
      { path: 'students', component: AdminStudents, name: 'admin-students' },
      { path: 'industries', component: AdminIndustries, name: 'admin-industries' },
      { path: 'placements', component: AdminPlacements, name: 'admin-placements' },
      { path: 'reports', component: AdminReports, name: 'admin-reports' }
    ]
  },
  { path: '/:pathMatch(.*)*', component: NotFound }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (authStore.loading) await authStore.init()

  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }
    if (to.meta.role && authStore.userRole !== to.meta.role) {
      // Redirect to correct dashboard
      if (authStore.isStudent) return next({ name: 'student-dashboard' })
      if (authStore.isIndustry) return next({ name: 'industry-dashboard' })
      if (authStore.isAdmin) return next({ name: 'admin-dashboard' })
    }
  }

  if ((to.name === 'login' || to.name === 'register') && authStore.isLoggedIn) {
    if (authStore.isStudent) return next({ name: 'student-dashboard' })
    if (authStore.isIndustry) return next({ name: 'industry-dashboard' })
    if (authStore.isAdmin) return next({ name: 'admin-dashboard' })
  }

  next()
})

export default router
