import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/firebase/config'
import {
  registerUser, loginUser, logoutUser,
  saveUserRole, getUserRole,
  saveStudentProfile, getStudentProfile,
  saveIndustryProfile, getIndustryProfile
} from '@/firebase/services'
import { onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isStudent = computed(() => userRole.value === 'student')
  const isIndustry = computed(() => userRole.value === 'industry')
  const isAdmin = computed(() => userRole.value === 'admin')

  // Initialize auth listener
  const init = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          const roleData = await getUserRole(firebaseUser.uid)
          if (roleData) {
            userRole.value = roleData.role
            if (roleData.role === 'student') {
              profile.value = await getStudentProfile(firebaseUser.uid)
            } else if (roleData.role === 'industry') {
              profile.value = await getIndustryProfile(firebaseUser.uid)
            }
          }
        } else {
          user.value = null
          userRole.value = null
          profile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  const register = async (email, password, role, profileData) => {
    const cred = await registerUser(email, password)
    const uid = cred.user.uid
    await saveUserRole(uid, role, email)
    if (role === 'student') {
      await saveStudentProfile(uid, { ...profileData, email })
    } else if (role === 'industry') {
      await saveIndustryProfile(uid, { ...profileData, email })
    }
    userRole.value = role
    profile.value = profileData
    return cred
  }

  const login = async (email, password) => {
    const cred = await loginUser(email, password)
    const uid = cred.user.uid
    const roleData = await getUserRole(uid)
    if (roleData) {
      userRole.value = roleData.role
      if (roleData.role === 'student') {
        profile.value = await getStudentProfile(uid)
      } else if (roleData.role === 'industry') {
        profile.value = await getIndustryProfile(uid)
      }
    }
    return { ...cred, role: roleData?.role }
  }

  const logout = async () => {
    await logoutUser()
    user.value = null
    userRole.value = null
    profile.value = null
  }

  const refreshProfile = async () => {
    if (!user.value) return
    if (userRole.value === 'student') {
      profile.value = await getStudentProfile(user.value.uid)
    } else if (userRole.value === 'industry') {
      profile.value = await getIndustryProfile(user.value.uid)
    }
  }

  return { user, userRole, profile, loading, isLoggedIn, isStudent, isIndustry, isAdmin, init, register, login, logout, refreshProfile }
})
