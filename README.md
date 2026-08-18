# SIWES Automated Placement & Recommendation System

A complete Vue.js + Firebase web application for the Students Industrial Work Experience Scheme (SIWES), featuring intelligent industry-student matching using a content-based recommendation algorithm.

---

## Features

### Student Portal
- Register with academic profile (department, skills, interests, location)
- Get AI-powered industry recommendations ranked by match score
- Apply to industries with one click
- Track application status in real time

### Industry Portal
- Register company profile and post SIWES vacancies
- Review student applications with full profile view
- Accept or reject applicants
- Manage multiple vacancies

### Admin Panel
- Full oversight of all students, industries, and placements
- Override application statuses
- Analytics dashboard with charts
- Export CSV placement reports

### Recommendation Engine
Content-based algorithm with four weighted criteria:
| Criterion | Weight |
|---|---|
| Department Match | 40% |
| Skills Match | 30% |
| Location Match | 20% |
| Interest Match | 10% |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Vue.js 3 (Composition API) | Frontend framework |
| Vue Router 4 | Client-side routing |
| Pinia | State management |
| Firebase Authentication | User login/register |
| Firebase Realtime Database | Backend storage |
| Vite | Build tool |

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `siwes-portal`)
3. Enable **Authentication** → Email/Password sign-in method
4. Enable **Realtime Database** → Start in test mode (for development)
5. Go to Project Settings → Your Apps → Web App → copy config
6. Paste config into `src/firebase/config.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### 3. Set up Firebase Realtime Database Rules
In Firebase Console → Realtime Database → Rules, use:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 4. Create Admin Account
After deploying, register a normal account, then manually set the role in Firebase Realtime Database:
- Go to `Realtime Database → users → {uid}`
- Change `"role": "student"` to `"role": "admin"`

### 5. Run Development Server
```bash
npm run dev
```
App runs at `http://localhost:5173`

### 6. Build for Production
```bash
npm run build
```
Outputs to `dist/` folder. Deploy to Firebase Hosting, Vercel, or Netlify.

---

## Project Structure

```
src/
├── firebase/
│   ├── config.js         # Firebase initialization
│   └── services.js       # All database CRUD functions
├── recommendation/
│   └── engine.js         # Core matching algorithm
├── store/
│   └── auth.js           # Pinia auth store
├── router/
│   └── index.js          # Vue Router with guards
├── components/
│   ├── AppSidebar.vue    # Shared navigation sidebar
│   ├── TagsInput.vue     # Skills/interests input
│   └── ScoreRing.vue     # Circular match score display
├── views/
│   ├── Home.vue          # Landing page
│   ├── Login.vue         # Sign in
│   ├── Register.vue      # Register (student/industry)
│   ├── student/
│   │   ├── Dashboard.vue
│   │   ├── Profile.vue
│   │   ├── Recommendations.vue
│   │   └── Applications.vue
│   ├── industry/
│   │   ├── Dashboard.vue
│   │   ├── Profile.vue
│   │   ├── Vacancies.vue
│   │   └── Applications.vue
│   └── admin/
│       ├── Dashboard.vue
│       ├── Students.vue
│       ├── Industries.vue
│       ├── Placements.vue
│       └── Reports.vue
├── App.vue
├── main.js
└── style.css
```

---

## User Roles

| Role | Access |
|---|---|
| `student` | Dashboard, Profile, Recommendations, Applications |
| `industry` | Dashboard, Profile, Vacancies, Applications |
| `admin` | Full access to all pages + reports |

---

## Algorithm Details

```
FOR each open vacancy:
  departmentScore  = matchDepartment(student.dept, vacancy.category)   × 40%
  skillScore       = matchSkills(student.skills, vacancy.requiredSkills) × 30%
  locationScore    = matchLocation(student.preferredLocation, vacancy.location) × 20%
  interestScore    = matchInterests(student.interests, vacancy.category)  × 10%
  totalScore       = sum of above

SORT vacancies by totalScore DESCENDING
DISPLAY top recommendations to student
```

Match score thresholds:
- **85%+** → Excellent Match
- **70–84%** → Good Match
- **50–69%** → Fair Match
- **< 50%** → Low Match

---

## License
Developed for academic/SIWES purposes.
