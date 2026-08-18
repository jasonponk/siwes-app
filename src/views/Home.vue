<template>
  <div class="home-page">
    <!-- Header -->
    <header class="home-header">
      <div class="header-inner">
        <div class="header-logo">
          <span class="header-logo-icon">🎓</span>
          <span class="header-logo-text">SIWES Portal</span>
        </div>
        <div class="header-actions">
          <router-link to="/login" class="btn btn-ghost btn-sm">Sign In</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Register</router-link>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content fade-in">
        <div class="hero-badge">🏆 ITF Endorsed Platform</div>
        <h1 class="hero-title">
          Automated SIWES<br/>
          <span class="hero-accent">Placement & Recommendation</span><br/>
          System
        </h1>
        <p class="hero-desc">
          Intelligently connect students with the right industries for their SIWES industrial training. 
          Powered by a smart recommendation engine that matches skills, disciplines, and career goals.
        </p>
        <div class="hero-cta">
          <router-link to="/register" class="btn btn-accent btn-lg">Get Started Free</router-link>
          <router-link to="/login" class="btn btn-outline btn-lg" style="border-color:#fff; color:#fff;">
            Sign In →
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><strong>Smart AI</strong><span>Matching</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><strong>3 Roles</strong><span>Student · Industry · Admin</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><strong>Real-time</strong><span>Firebase Backend</span></div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="features-inner">
        <div class="section-label">Core Features</div>
        <h2 class="section-title">Everything You Need for SIWES Placement</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <div class="hiw-inner">
        <div class="section-label">Process</div>
        <h2 class="section-title">How the Recommendation Algorithm Works</h2>
        <div class="steps">
          <div v-for="(step, i) in steps" :key="i" class="step">
            <div class="step-num">0{{ i + 1 }}</div>
            <div>
              <h4>{{ step.title }}</h4>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-banner">
      <h2>Ready to find your perfect industrial placement?</h2>
      <p>Join thousands of students and industries on the SIWES Portal</p>
      <router-link to="/register" class="btn btn-accent btn-lg">Create Your Account</router-link>
    </section>

    <!-- Footer -->
    <footer class="home-footer">
      <div class="footer-inner">
        <div>
          <div class="header-logo" style="margin-bottom:8px">
            <span class="header-logo-icon">🎓</span>
            <span class="header-logo-text">SIWES Portal</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted)">
            Automated Student-Industry Placement & Recommendation System
          </p>
        </div>
        <div style="font-size:0.82rem; color:var(--text-muted)">
          © {{ new Date().getFullYear() }} SIWES Placement System. Powered by Vue.js & Firebase.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const features = [
  { icon: '🤖', title: 'Smart Recommendations', desc: 'AI-powered matching engine scores industries based on department, skills, location, and career interests.' },
  { icon: '🎓', title: 'Student Profiles', desc: 'Students create comprehensive profiles with academic info, skills, and preferred locations for better matching.' },
  { icon: '🏭', title: 'Industry Registration', desc: 'Companies register, post vacancies, and define required skills to attract the right student candidates.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'SIWES coordinators get full oversight with reports, placement stats, and activity monitoring tools.' },
  { icon: '⚡', title: 'Real-time Updates', desc: 'Firebase Realtime Database ensures instant updates across students, industries, and admins.' },
  { icon: '📈', title: 'Analytics & Reports', desc: 'Generate detailed placement reports, track participation rates, and export data for decision-making.' }
]

const steps = [
  { title: 'Student Profile Analysis', desc: 'The engine retrieves the student\'s department, skills list, preferred location, and career interests.' },
  { title: 'Department Match (40%)', desc: 'Compares student academic discipline with industry category using intelligent keyword mapping.' },
  { title: 'Skill Match (30%)', desc: 'Evaluates overlap between student skills and the required skills listed by the industry vacancy.' },
  { title: 'Location Match (20%)', desc: 'Checks compatibility between student\'s preferred location and the industry\'s office location.' },
  { title: 'Interest Match (10%)', desc: 'Aligns student career interests with the industry sector for better long-term fit.' },
  { title: 'Score & Rank', desc: 'Total weighted score calculated. Industries ranked highest-to-lowest and displayed as recommendations.' }
]
</script>

<style scoped>
.home-page { min-height: 100vh; background: var(--surface); }

.home-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
}
.header-logo { display: flex; align-items: center; gap: 10px; }
.header-logo-icon { font-size: 1.6rem; }
.header-logo-text { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--primary); }
.header-actions { display: flex; gap: 10px; align-items: center; }

.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 60%, #1a5c9e 100%);
  padding: 100px 24px 80px;
}
.hero-bg {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 70% 50%, rgba(0,184,148,0.15) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
}
.hero-content {
  position: relative; max-width: 800px; margin: 0 auto; text-align: center;
}
.hero-badge {
  display: inline-block; padding: 6px 16px;
  background: rgba(0,184,148,0.2); color: var(--accent-light);
  border: 1px solid rgba(0,184,148,0.3);
  border-radius: 99px; font-size: 0.82rem; font-weight: 600;
  margin-bottom: 24px;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: #fff; margin-bottom: 20px; line-height: 1.1;
}
.hero-accent { color: var(--accent-light); }
.hero-desc {
  font-size: 1.05rem; color: rgba(255,255,255,0.75);
  max-width: 600px; margin: 0 auto 36px; line-height: 1.7;
}
.hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
.hero-stats {
  display: flex; align-items: center; justify-content: center;
  gap: 32px; flex-wrap: wrap;
}
.hero-stat { display: flex; flex-direction: column; text-align: center; }
.hero-stat strong { font-family: var(--font-display); font-size: 1.1rem; color: #fff; font-weight: 800; }
.hero-stat span { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
.hero-stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

.features { padding: 80px 24px; background: var(--surface-2); }
.features-inner { max-width: 1200px; margin: 0 auto; }
.section-label {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent);
  margin-bottom: 12px;
}
.section-title { font-size: clamp(1.5rem, 3vw, 2.2rem); margin-bottom: 48px; color: var(--text); }
.features-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;
}
.feature-card {
  background: var(--surface); border-radius: var(--radius);
  border: 1px solid var(--border); padding: 28px;
  transition: all var(--transition);
}
.feature-card:hover {
  transform: translateY(-4px); box-shadow: var(--shadow-md);
  border-color: var(--primary);
}
.feature-icon { font-size: 2rem; margin-bottom: 16px; }
.feature-card h3 { font-size: 1rem; margin-bottom: 8px; }
.feature-card p { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; }

.how-it-works { padding: 80px 24px; background: var(--surface); }
.hiw-inner { max-width: 900px; margin: 0 auto; }
.steps { display: flex; flex-direction: column; gap: 0; }
.step {
  display: flex; gap: 24px; padding: 24px 0;
  border-bottom: 1px solid var(--border); align-items: flex-start;
}
.step:last-child { border-bottom: none; }
.step-num {
  font-family: var(--font-display); font-size: 2rem; font-weight: 800;
  color: var(--surface-3); flex-shrink: 0; width: 60px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.step h4 { font-size: 1rem; margin-bottom: 4px; }
.step p { font-size: 0.88rem; color: var(--text-muted); }

.cta-banner {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  padding: 80px 24px; text-align: center;
}
.cta-banner h2 { font-size: 2rem; color: #fff; margin-bottom: 12px; }
.cta-banner p { color: rgba(255,255,255,0.7); margin-bottom: 32px; }

.home-footer { background: var(--surface-2); border-top: 1px solid var(--border); padding: 32px 24px; }
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
}
</style>
