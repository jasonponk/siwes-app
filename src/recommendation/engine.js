/**
 * SIWES Recommendation Engine
 * Algorithm: Content-Based Filtering
 * Criteria: Department Match + Skill Match + Location Match + Interest Match
 */

// Weight configuration (must sum to 100)
const WEIGHTS = {
  department: 40,
  skills: 30,
  location: 20,
  interests: 10
}

/**
 * Normalize a string for comparison
 */
const normalize = (str) => (str || '').toLowerCase().trim()

/**
 * Calculate department/category match score (0–100)
 */
const calcDepartmentMatch = (studentDept, industryCategory) => {
  if (!studentDept || !industryCategory) return 0
  const dept = normalize(studentDept)
  const cat = normalize(industryCategory)

  if (dept === cat) return 100

  // Mapping of departments to relevant industry categories
  const mappings = {
    'computer science': ['ict', 'software', 'technology', 'it', 'computer', 'data', 'cyber', 'web', 'digital'],
    'computer engineering': ['ict', 'software', 'hardware', 'technology', 'electronics', 'embedded', 'computer'],
    'electrical engineering': ['power', 'energy', 'electronics', 'electrical', 'telecommunications', 'manufacturing'],
    'mechanical engineering': ['manufacturing', 'automotive', 'oil & gas', 'construction', 'mechanical', 'aerospace'],
    'civil engineering': ['construction', 'infrastructure', 'real estate', 'environmental', 'surveying'],
    'chemical engineering': ['petrochemicals', 'oil & gas', 'pharmaceuticals', 'food processing', 'chemical'],
    'accounting': ['finance', 'banking', 'audit', 'accounting', 'insurance', 'financial services'],
    'economics': ['finance', 'banking', 'research', 'policy', 'consulting', 'financial services'],
    'medicine': ['healthcare', 'hospital', 'pharmaceutical', 'medical', 'clinic'],
    'pharmacy': ['pharmaceutical', 'healthcare', 'hospital', 'drugstore'],
    'microbiology': ['pharmaceutical', 'healthcare', 'food processing', 'research', 'laboratory'],
    'agriculture': ['agro-processing', 'farming', 'agric', 'food processing', 'environmental'],
    'mass communication': ['media', 'broadcasting', 'advertising', 'public relations', 'journalism', 'marketing'],
    'business administration': ['management consulting', 'retail', 'logistics', 'hr', 'marketing', 'business'],
    'law': ['legal', 'compliance', 'government', 'ngo', 'law firm'],
    'architecture': ['construction', 'real estate', 'design', 'urban planning', 'architectural'],
    'environmental science': ['environmental', 'ngo', 'government', 'research', 'oil & gas'],
    'physics': ['research', 'technology', 'laboratory', 'energy', 'academia'],
    'statistics': ['data', 'research', 'finance', 'ict', 'insurance', 'actuarial'],
  }

  // Check if student department matches any related industry category keywords
  for (const [key, relatedCats] of Object.entries(mappings)) {
    if (dept.includes(key) || key.includes(dept)) {
      if (relatedCats.some(rc => cat.includes(rc) || rc.includes(cat))) return 75
    }
  }

  // Partial word match fallback
  const deptWords = dept.split(/\s+/)
  const catWords = cat.split(/\s+/)
  const overlap = deptWords.filter(w => catWords.some(c => c.includes(w) || w.includes(c)))
  if (overlap.length > 0) return 50

  return 0
}

/**
 * Calculate skill match score (0–100)
 */
const calcSkillMatch = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 50 // no requirements = open to all
  if (!studentSkills.length) return 10

  const normStudent = studentSkills.map(normalize)
  const normRequired = requiredSkills.map(normalize)

  let matched = 0
  for (const req of normRequired) {
    if (normStudent.some(s => s.includes(req) || req.includes(s))) {
      matched++
    }
  }

  return Math.round((matched / normRequired.length) * 100)
}

/**
 * Calculate location match score (0–100)
 */
const calcLocationMatch = (preferredLocation, industryLocation) => {
  if (!preferredLocation || preferredLocation === 'any') return 70
  if (!industryLocation) return 30

  const pref = normalize(preferredLocation)
  const loc = normalize(industryLocation)

  if (pref === loc) return 100
  if (loc.includes(pref) || pref.includes(loc)) return 85

  // State-level match
  const nigerianStates = [
    'lagos', 'abuja', 'kano', 'ibadan', 'port harcourt', 'benin', 'maiduguri',
    'zaria', 'aba', 'onitsha', 'warri', 'enugu', 'abeokuta', 'oyo', 'kaduna',
    'sokoto', 'ilorin', 'owerri', 'uyo', 'calabar', 'akure', 'ondo', 'lokoja',
    'minna', 'lafia', 'yola', 'bauchi', 'gombe', 'makurdi', 'abakaliki', 'asaba'
  ]

  const prefState = nigerianStates.find(s => pref.includes(s))
  const locState = nigerianStates.find(s => loc.includes(s))
  if (prefState && locState && prefState === locState) return 80

  return 10
}

/**
 * Calculate interest match score (0–100)
 */
const calcInterestMatch = (studentInterests = [], industryCategory) => {
  if (!studentInterests.length || !industryCategory) return 50
  const cat = normalize(industryCategory)
  const matched = studentInterests.some(i => {
    const interest = normalize(i)
    return cat.includes(interest) || interest.includes(cat)
  })
  return matched ? 100 : 20
}

/**
 * Main recommendation function
 * @param {Object} student - Student profile
 * @param {Array} vacancies - Array of vacancy objects
 * @param {Object} industriesMap - Map of industryUid → industry profile
 * @returns {Array} Ranked list of { vacancy, industry, score, breakdown }
 */
export const generateRecommendations = (student, vacancies, industriesMap = {}) => {
  const results = []

  for (const vacancy of vacancies) {
    if (vacancy.status !== 'open') continue
    if (vacancy.availableSlots !== undefined && vacancy.availableSlots <= 0) continue

    const industry = industriesMap[vacancy.industryUid] || {}

    // Calculate individual scores
    const deptScore = calcDepartmentMatch(student.department, vacancy.category || industry.category)
    const skillScore = calcSkillMatch(
      student.skills || [],
      vacancy.requiredSkills || []
    )
    const locScore = calcLocationMatch(student.preferredLocation, vacancy.location || industry.location)
    const interestScore = calcInterestMatch(student.interests || [], vacancy.category || industry.category)

    // Weighted total
    const totalScore = Math.round(
      (deptScore * WEIGHTS.department / 100) +
      (skillScore * WEIGHTS.skills / 100) +
      (locScore * WEIGHTS.location / 100) +
      (interestScore * WEIGHTS.interests / 100)
    )

    results.push({
      vacancy,
      industry,
      score: totalScore,
      breakdown: {
        department: deptScore,
        skills: skillScore,
        location: locScore,
        interests: interestScore
      }
    })
  }

  // Sort descending by score
  return results
    .sort((a, b) => b.score - a.score)
    .filter(r => r.score > 0)
}

/**
 * Get match label from score
 */
export const getMatchLabel = (score) => {
  if (score >= 85) return { label: 'Excellent Match', color: '#10b981' }
  if (score >= 70) return { label: 'Good Match', color: '#3b82f6' }
  if (score >= 50) return { label: 'Fair Match', color: '#f59e0b' }
  return { label: 'Low Match', color: '#6b7280' }
}
