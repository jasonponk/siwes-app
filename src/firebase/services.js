import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue
} from 'firebase/database'

// ─── AUTH SERVICES ───────────────────────────────────────────────────────────

export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const logoutUser = async () => {
  return await signOut(auth)
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// ─── DATABASE SERVICES ───────────────────────────────────────────────────────

// Students
export const saveStudentProfile = async (uid, data) => {
  await set(ref(db, `students/${uid}`), { ...data, uid, createdAt: Date.now() })
}

export const getStudentProfile = async (uid) => {
  const snap = await get(ref(db, `students/${uid}`))
  return snap.exists() ? snap.val() : null
}

export const getAllStudents = async () => {
  const snap = await get(ref(db, 'students'))
  return snap.exists() ? Object.values(snap.val()) : []
}

export const updateStudentProfile = async (uid, data) => {
  await update(ref(db, `students/${uid}`), data)
}

// Industries
export const saveIndustryProfile = async (uid, data) => {
  await set(ref(db, `industries/${uid}`), { ...data, uid, createdAt: Date.now() })
}

export const getIndustryProfile = async (uid) => {
  const snap = await get(ref(db, `industries/${uid}`))
  return snap.exists() ? snap.val() : null
}

export const getAllIndustries = async () => {
  const snap = await get(ref(db, 'industries'))
  return snap.exists() ? Object.values(snap.val()) : []
}

export const updateIndustryProfile = async (uid, data) => {
  await update(ref(db, `industries/${uid}`), data)
}

// Vacancies
export const postVacancy = async (industryUid, data) => {
  const vacRef = push(ref(db, 'vacancies'))
  await set(vacRef, { ...data, industryUid, id: vacRef.key, createdAt: Date.now(), status: 'open' })
  return vacRef.key
}

export const getAllVacancies = async () => {
  const snap = await get(ref(db, 'vacancies'))
  return snap.exists() ? Object.values(snap.val()) : []
}

export const getVacanciesByIndustry = async (industryUid) => {
  const snap = await get(ref(db, 'vacancies'))
  if (!snap.exists()) return []
  return Object.values(snap.val()).filter(v => v.industryUid === industryUid)
}

export const updateVacancy = async (vacId, data) => {
  await update(ref(db, `vacancies/${vacId}`), data)
}

export const deleteVacancy = async (vacId) => {
  await remove(ref(db, `vacancies/${vacId}`))
}

// Applications / Placements
export const applyForPlacement = async (studentUid, vacancyId, industryUid) => {
  const appRef = push(ref(db, 'placements'))
  await set(appRef, {
    id: appRef.key,
    studentUid,
    vacancyId,
    industryUid,
    status: 'pending',
    appliedAt: Date.now()
  })
  return appRef.key
}

export const getAllPlacements = async () => {
  const snap = await get(ref(db, 'placements'))
  return snap.exists() ? Object.values(snap.val()) : []
}

export const getPlacementsByStudent = async (studentUid) => {
  const snap = await get(ref(db, 'placements'))
  if (!snap.exists()) return []
  return Object.values(snap.val()).filter(p => p.studentUid === studentUid)
}

export const getPlacementsByIndustry = async (industryUid) => {
  const snap = await get(ref(db, 'placements'))
  if (!snap.exists()) return []
  return Object.values(snap.val()).filter(p => p.industryUid === industryUid)
}

export const updatePlacementStatus = async (placementId, status) => {
  await update(ref(db, `placements/${placementId}`), { status, updatedAt: Date.now() })
}

// User roles
export const saveUserRole = async (uid, role, email) => {
  await set(ref(db, `users/${uid}`), { uid, role, email, createdAt: Date.now() })
}

export const getUserRole = async (uid) => {
  const snap = await get(ref(db, `users/${uid}`))
  return snap.exists() ? snap.val() : null
}

// Notifications
export const addNotification = async (uid, message, type = 'info') => {
  const notifRef = push(ref(db, `notifications/${uid}`))
  await set(notifRef, { id: notifRef.key, message, type, read: false, createdAt: Date.now() })
}

export const getNotifications = async (uid) => {
  const snap = await get(ref(db, `notifications/${uid}`))
  return snap.exists() ? Object.values(snap.val()).sort((a, b) => b.createdAt - a.createdAt) : []
}

export const markNotificationRead = async (uid, notifId) => {
  await update(ref(db, `notifications/${uid}/${notifId}`), { read: true })
}
