
// ============ PARTICLES ============
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0, mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
    this.y = Math.random() * canvas.height;
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.size = Math.random() * 1.6 + 0.4;
    this.baseAlpha = Math.random() * 0.5 + 0.15;
    this.alpha = this.baseAlpha;
    this.color = Math.random() > 0.6 ? [127, 231, 255] : [163, 148, 255];
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.02;
    this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.15;

    // mouse interaction
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 0.8;
      this.y += (dy / dist) * force * 0.8;
    }

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 18000));
  for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();
window.addEventListener('resize', initParticles);

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(163, 148, 255, ${0.12 * (1 - dist / 130)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ============ NAV SCROLL ============
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ============ MOBILE MENU ============
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ============ REVEAL ON SCROLL ============
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
reveals.forEach(r => observer.observe(r));

// ============ FAQ ============
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-question');
  const a = item.querySelector('.faq-answer');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-answer').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ============ SUGGESTION INTERACTIONS ============
document.querySelectorAll('.suggestion').forEach(s => {
  s.style.cursor = 'pointer';
  s.addEventListener('click', () => {
    // get label and text from the suggestion
    const label = s.querySelector('.suggestion-label')?.textContent?.trim() || '';
    const text  = s.querySelector('.suggestion-text')?.innerText?.trim() || '';

    // open editor and pre-fill Ask Lumen
    if (currentUser) {
      openEditor();
    } else {
      switchAuthTab('signup');
      openModal('authModal');
    }
    setTimeout(() => {
      const input = document.getElementById('aiPromptInput');
      if (input) {
        input.value = label + ': ' + text;
        input.focus();
        showToast('Suggestion loaded — click Ask Lumen!', 'success');
      }
    }, 400);
  });
});

// ============ EDITOR PREVIEW TABS ============
document.querySelectorAll('.editor-tab').forEach(tab => {
  tab.style.cursor = 'pointer';
  tab.addEventListener('click', () => {
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const name = tab.textContent.trim();
    if (name === '+ new') {
      if (currentUser) openEditor();
      else { switchAuthTab('signup'); openModal('authModal'); }
    } else {
      showToast('Opening: ' + name, 'info');
    }
  });
});

// ============ EDITOR DOTS ============
document.querySelectorAll('.editor-dot').forEach((dot, i) => {
  dot.style.cursor = 'pointer';
  const colors = ['#ff5f57', '#febc2e', '#28c840'];
  dot.style.background = colors[i] || dot.style.background;
  dot.addEventListener('click', () => {
    if (i === 0) showToast('Close — use the Close button in editor', 'info');
    if (i === 1) showToast('Minimized', 'info');
    if (i === 2) showToast('Fullscreen mode', 'info');
  });
});

// ============ DASHBOARD STATS HOVER ============
document.querySelectorAll('.stat').forEach(stat => {
  stat.style.cursor = 'pointer';
  stat.addEventListener('click', () => {
    const label = stat.querySelector('.stat-label')?.textContent || '';
    showToast('Viewing: ' + label + ' details', 'info');
  });
});

// ============ ACTIVITY ITEMS ============
document.querySelectorAll('.activity-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const text = item.querySelector('.activity-text')?.innerText || '';
    showToast(text, 'info');
  });
});

// ============ ANIMATED BARS (loop) ============
const bars = document.querySelectorAll('.bar');
let activeIdx = 4;
setInterval(() => {
  bars.forEach(b => b.classList.remove('active'));
  activeIdx = (activeIdx + 1) % bars.length;
  if (bars[activeIdx]) bars[activeIdx].classList.add('active');
}, 1800);

// ============ SMOOTH ANCHOR ============
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
//  LUMEN APP — AUTH · EDITOR · AI
// ============================================================
const LUMEN_API = 'http://localhost:3000/api/chat';
let currentUser = JSON.parse(localStorage.getItem('lumen_user') || 'null');
let aiLoading = false;
let autoSaveTimer = null;

// ---- INIT ----
(function init() {
  updateNavForUser();
  bindCtaButtons();
  bindFooterLinks();
  bindDashboardButtons();
})();

// ---- NAV ----
function updateNavForUser() {
  if (!currentUser) return;
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;
  const ghostBtn = navCta.querySelector('.btn-ghost');
  const primaryBtn = navCta.querySelector('.btn-primary');
  if (ghostBtn) {
    ghostBtn.outerHTML = `<div class="nav-user" onclick="handleSignOut()">
      <div class="nav-user-avatar">${currentUser.name[0].toUpperCase()}</div>
      <span>${currentUser.name.split(' ')[0]}</span>
    </div>`;
  }
  if (primaryBtn) {
    primaryBtn.innerHTML = 'Open editor <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';
    primaryBtn.onclick = (e) => { e.preventDefault(); openEditor(); };
  }
}

// ---- BIND CTA BUTTONS ----
function bindCtaButtons() {
  document.querySelectorAll('a.btn[href="#"], a.btn[href=""]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const txt = btn.textContent.trim().toLowerCase();
      if (txt.includes('sign in')) { switchAuthTab('signin'); openModal('authModal'); }
      else if (txt.includes('get lumen') || txt.includes('start writing') || txt.includes('choose author') || txt.includes('start free') || txt.includes('talk to us')) {
        if (currentUser) openEditor();
        else { switchAuthTab('signup'); openModal('authModal'); }
      } else {
        if (currentUser) openEditor();
        else { switchAuthTab('signup'); openModal('authModal'); }
      }
    });
  });
}

// ---- CONTENT MODAL ----
function openContentModal(html) {
  document.getElementById('contentModalBody').innerHTML = html;
  document.getElementById('contentModal').classList.add('open');
}
function closeContentModal() {
  document.getElementById('contentModal').classList.remove('open');
}
document.getElementById('contentModal').addEventListener('click', function(e) {
  if (e.target === this) closeContentModal();
});

// ---- FOOTER LINK CONTENT ----
const footerContent = {
  changelog: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Changelog</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:24px">What's new in Lumen</div>
    ${[
      ['v1.4.0 — May 2026', 'Introduced Research mode with live citations. AI panel now supports multi-turn conversation. Export to PDF added.'],
      ['v1.3.2 — Apr 2026', 'Fixed editor scroll jank on Safari. Improved voice-trained model accuracy by 18%. Dark mode contrast fixes.'],
      ['v1.3.0 — Mar 2026', 'Command Center dashboard launched. Team comments and annotations now live for Studio plan.'],
      ['v1.2.1 — Feb 2026', 'Keyboard shortcuts added (⌘K command bar). Writing streaks and goals introduced in analytics.'],
      ['v1.2.0 — Jan 2026', 'Spaces (shared folders) rolled out to all Author and Studio users. Style model training UI improved.'],
      ['v1.1.0 — Dec 2025', 'Public beta launch. Editor, AI composer, and basic analytics shipped.'],
    ].map(([v, d]) => `
      <div style="border-left:2px solid var(--line-strong);padding:12px 18px;margin-bottom:16px">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--violet-soft);margin-bottom:4px">${v}</div>
        <div style="font-size:14px;color:var(--ink-dim);line-height:1.6">${d}</div>
      </div>`).join('')}`,

  guides: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Guides</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:24px">Learn to get the most from Lumen</div>
    ${[
      ['Getting started', 'Set up your workspace, create your first doc, and meet your AI companion.'],
      ['Training your voice model', 'Paste in 3–5 writing samples so Lumen learns your exact style and rhythm.'],
      ['Using the Research tool', 'Ask any question — Lumen pulls real sources and formats citations automatically.'],
      ['Keyboard shortcuts', 'Speed up every action: ⌘K command bar, ⌘/ AI compose, ⌘S save, ⌘E export.'],
      ['Spaces & collaboration', 'Invite teammates, set roles, and manage shared brand voice in Studio plan.'],
      ['Exporting your work', 'One-click export to Markdown, DOCX, or PDF from any document.'],
    ].map(([t, d]) => `
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="showToast('Opening: ${t}', 'info')">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(139,122,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--violet-soft)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div><div style="font-weight:600;font-size:14px;margin-bottom:3px">${t}</div><div style="font-size:13px;color:var(--ink-dim)">${d}</div></div>
      </div>`).join('')}`,

  templates: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Templates</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:24px">Start writing in seconds</div>
    ${[
      ['Essay draft', 'Thesis, body, conclusion structure. Great for opinion pieces and long-form analysis.', '✦'],
      ['Newsletter issue', 'Opener, main story, quick takes, sign-off. Readable in 3 minutes or less.', '◈'],
      ['Product announcement', 'Hook, feature highlights, call to action. Built for launch days.', '⬡'],
      ['Research brief', 'Question, methodology, findings, citations. Ready for peer review.', '◎'],
      ['Short story', 'Scene, tension, turn, resolution. Classic three-act in a single page.', '◇'],
      ['Meeting notes', 'Agenda, decisions, action items, owners. Never lose context again.', '▣'],
    ].map(([t, d, ic]) => `
      <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="openEditorWithTemplate('${t}'); closeContentModal();">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(139,122,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:var(--violet-soft)">${ic}</div>
        <div style="flex:1"><div style="font-weight:600;font-size:14px;margin-bottom:3px">${t}</div><div style="font-size:13px;color:var(--ink-dim)">${d}</div></div>
        <span style="font-size:11px;color:var(--violet-soft);font-family:'JetBrains Mono',monospace;align-self:center">Use →</span>
      </div>`).join('')}`,

  stylemodels: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Style Models</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:24px">Train Lumen to write like you</div>
    <div style="font-size:14px;color:var(--ink-dim);line-height:1.8;margin-bottom:20px">A style model is a private, encrypted fingerprint of your writing voice — built from samples you provide. Lumen uses it to match your tone, sentence rhythm, vocabulary, and pacing across every session.</div>
    ${[
      ['Personal voice', 'Upload 3–5 of your best pieces. Lumen will learn your signature style.', 'Active'],
      ['Brand voice', 'For Studio teams — define tone, banned words, and approved phrasing.', 'Studio only'],
      ['Minimalist mode', 'Short sentences, sparse adjectives, high signal. Hemingway-adjacent.', 'Built-in'],
      ['Academic mode', 'Formal register, passive voice where appropriate, citation-ready.', 'Built-in'],
    ].map(([t, d, badge]) => `
      <div style="padding:14px 16px;background:rgba(139,122,255,0.06);border:1px solid var(--line);border-radius:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:600;font-size:14px;margin-bottom:3px">${t}</div><div style="font-size:12px;color:var(--ink-dim)">${d}</div></div>
        <span style="font-size:10px;padding:3px 8px;background:rgba(127,231,255,0.1);border:1px solid rgba(127,231,255,0.2);border-radius:100px;color:#7fe7ff;font-family:'JetBrains Mono',monospace;flex-shrink:0;margin-left:12px">${badge}</span>
      </div>`).join('')}`,

  apidocs: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">API Docs</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Integrate Lumen into your workflow</div>
    <div style="font-size:13px;color:var(--ink-dim);margin-bottom:16px">Base URL: <code style="font-family:'JetBrains Mono',monospace;color:var(--violet-soft);background:rgba(139,122,255,0.1);padding:2px 8px;border-radius:6px">https://api.lumen.ai/v1</code></div>
    ${[
      ['POST', '/compose', 'Generate or continue writing based on a prompt and optional style model.'],
      ['POST', '/improve', 'Rewrite a passage — sharper, shorter, or in a different tone.'],
      ['POST', '/research', 'Run a research query and receive a response with inline citations.'],
      ['GET', '/documents', 'List all documents in the authenticated user\'s workspace.'],
      ['POST', '/documents', 'Create a new document with optional template and metadata.'],
    ].map(([m, p, d]) => `
      <div style="padding:12px 16px;background:rgba(10,14,36,0.6);border:1px solid var(--line);border-radius:10px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;font-size:12px">
        <div style="margin-bottom:6px"><span style="color:${m==='POST'?'#7fe7ff':'#a394ff'}">${m}</span> <span style="color:var(--ink)">${p}</span></div>
        <div style="font-size:11px;color:var(--ink-dim);font-family:'Manrope',sans-serif">${d}</div>
      </div>`).join('')}`,

  about: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">About Lumen</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Built for the writers who care about their craft</div>
    <div style="font-size:15px;color:var(--ink-dim);line-height:1.9;margin-bottom:20px">Lumen began as a side project in a borrowed Brooklyn apartment. Two writers, one designer, and a restless curiosity about what AI could become when it stopped trying to replace the author and started trying to <em style="color:var(--ink)">serve</em> them.</div>
    <div style="font-size:15px;color:var(--ink-dim);line-height:1.9;margin-bottom:24px">Today Lumen is used by journalists, novelists, researchers, and editorial teams in 40 countries. We are independent, venture-backed, and committed to keeping writing human at the center.</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      ${[['Founded','2024'],['Team','28 people'],['Users','12,000+'],['Countries','40+']].map(([l,v])=>`
      <div style="padding:16px;background:rgba(139,122,255,0.08);border:1px solid var(--line);border-radius:12px;text-align:center">
        <div style="font-size:22px;font-weight:700;color:var(--violet-soft);font-family:'Fraunces',serif">${v}</div>
        <div style="font-size:12px;color:var(--ink-faded);margin-top:4px">${l}</div>
      </div>`).join('')}
    </div>`,

  journal: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Journal</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:24px">Writing, craft, and the tools behind them</div>
    ${[
      ['On the ethics of AI ghostwriting', 'May 12, 2026', 'When a machine helps you write, whose voice is it? We invited six writers to weigh in.'],
      ['Why we rebuilt the editor from scratch', 'Apr 28, 2026', 'A deep look at the decisions behind Lumen\'s new composer — and what we got wrong the first time.'],
      ['The blank page is a design problem', 'Apr 3, 2026', 'Most writing tools make starting too hard. Here\'s how we think about first-sentence UX.'],
      ['Research mode: how it works', 'Mar 15, 2026', 'Behind the scenes of our citation engine — the messy, humbling work of getting facts right.'],
    ].map(([t, d, s]) => `
      <div style="padding:16px 0;border-bottom:1px solid var(--line);cursor:pointer" onclick="showToast('Opening article…', 'info')">
        <div style="font-size:10px;color:var(--ink-faded);font-family:'JetBrains Mono',monospace;margin-bottom:6px">${d}</div>
        <div style="font-weight:600;font-size:15px;margin-bottom:6px;color:var(--ink)">${t}</div>
        <div style="font-size:13px;color:var(--ink-dim);line-height:1.6">${s}</div>
      </div>`).join('')}`,

  careers: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Careers</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Join a small team building something lasting</div>
    <div style="font-size:14px;color:var(--ink-dim);line-height:1.8;margin-bottom:20px">We work async-first across Brooklyn, Lisbon, and wherever good writing happens. We care about craft, clarity, and shipping things that feel right.</div>
    ${[
      ['Senior Product Designer', 'Full-time · Remote', 'Design the next generation of the Lumen editor and AI interaction patterns.'],
      ['ML Engineer — Language', 'Full-time · Remote', 'Fine-tune and evaluate language models for writing quality, style transfer, and factuality.'],
      ['Growth Engineer', 'Full-time · Remote', 'Own acquisition, activation, and onboarding experiments across the funnel.'],
      ['Editorial Lead', 'Part-time · Contract', 'Shape the voice of our journal, docs, and in-product copy.'],
    ].map(([t, m, d]) => `
      <div style="padding:16px;background:rgba(139,122,255,0.06);border:1px solid var(--line);border-radius:12px;margin-bottom:10px;cursor:pointer" onclick="showToast('Application form coming soon', 'info')">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
          <div style="font-weight:600;font-size:14px">${t}</div>
          <span style="font-size:10px;padding:3px 8px;background:rgba(127,231,255,0.1);border:1px solid rgba(127,231,255,0.2);border-radius:100px;color:#7fe7ff;font-family:'JetBrains Mono',monospace;flex-shrink:0;margin-left:12px">${m}</span>
        </div>
        <div style="font-size:13px;color:var(--ink-dim)">${d}</div>
      </div>`).join('')}`,

  press: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Press</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Press kit & media resources</div>
    <div style="font-size:14px;color:var(--ink-dim);line-height:1.8;margin-bottom:20px">For press inquiries, interviews, and partnership requests, reach us at <span style="color:var(--violet-soft)">press@lumen.ai</span></div>
    <div style="margin-bottom:20px">
      <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--ink-faded);margin-bottom:10px;letter-spacing:0.1em">PRESS COVERAGE</div>
      ${[
        ['"The most thoughtful writing AI we\'ve tested."','The Verge','Jan 2026'],
        ['"Lumen might actually make me a better writer."','Wired','Nov 2025'],
        ['"The blank-page killer."','Fast Company','Oct 2025'],
      ].map(([q,p,d])=>`
      <div style="padding:14px 16px;border-left:2px solid var(--violet-soft);margin-bottom:10px">
        <div style="font-size:14px;font-style:italic;color:var(--ink);margin-bottom:6px">${q}</div>
        <div style="font-size:12px;color:var(--ink-faded)">${p} · ${d}</div>
      </div>`).join('')}
    </div>
    <button class="btn btn-glass" style="width:100%;justify-content:center" onclick="showToast('Press kit downloading…', 'success')">Download press kit (.zip)</button>`,

  privacy: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Privacy Policy</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Last updated: January 15, 2026</div>
    ${[
      ['What we collect', 'Account information (name, email), documents you create, usage analytics (anonymized), and billing details (processed by Stripe — we never see your card number).'],
      ['What we never do', 'We do not sell your data. We do not train our shared models on your private documents. Your writing belongs to you.'],
      ['How we store it', 'All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). Style models are stored in isolated, user-specific containers.'],
      ['Your rights', 'You may export all your data, request deletion, or revoke third-party access at any time from your account settings.'],
      ['Cookies', 'We use strictly necessary cookies for authentication and optional analytics cookies (opt-out available in settings).'],
      ['Contact', 'Privacy questions? Email privacy@lumen.ai or write to: Lumen Studio Inc., 123 Atlantic Ave, Brooklyn NY 11201.'],
    ].map(([h,b])=>`
      <div style="margin-bottom:18px">
        <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:var(--ink)">${h}</div>
        <div style="font-size:13px;color:var(--ink-dim);line-height:1.7">${b}</div>
      </div>`).join('')}`,

  terms: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Terms of Service</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">Last updated: January 15, 2026</div>
    ${[
      ['Acceptance', 'By using Lumen you agree to these Terms. If you don\'t agree, please don\'t use the service.'],
      ['Your content', 'You own everything you write in Lumen. By using the service you grant us a limited license to process your content solely to provide the service.'],
      ['Acceptable use', 'You may not use Lumen to generate spam, disinformation, illegal content, or to infringe on others\' intellectual property.'],
      ['Subscriptions', 'Paid plans are billed monthly or yearly. You may cancel at any time; cancellations take effect at the end of the billing period.'],
      ['Termination', 'We may suspend accounts that violate these Terms. You may delete your account at any time and all data will be purged within 30 days.'],
      ['Limitation of liability', 'Lumen is provided "as is." We are not liable for lost documents, missed deadlines, or any indirect damages arising from use of the service.'],
    ].map(([h,b])=>`
      <div style="margin-bottom:18px">
        <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:var(--ink)">${h}</div>
        <div style="font-size:13px;color:var(--ink-dim);line-height:1.7">${b}</div>
      </div>`).join('')}`,

  security: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Security</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">How we protect your writing</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
      ${[['SOC 2 Type II','Certified'],['GDPR','Compliant'],['Encryption','AES-256'],['TLS','1.3'],['Uptime SLA','99.9%'],['Backups','Daily']].map(([l,v])=>`
      <div style="padding:14px;background:rgba(139,122,255,0.08);border:1px solid var(--line);border-radius:12px;text-align:center">
        <div style="font-size:16px;font-weight:700;color:var(--violet-soft)">${v}</div>
        <div style="font-size:11px;color:var(--ink-faded);margin-top:3px">${l}</div>
      </div>`).join('')}
    </div>
    ${[
      ['Infrastructure', 'Lumen runs on AWS in us-east-1 and eu-west-1, with automatic failover. All data is replicated across three availability zones.'],
      ['Access controls', 'Engineers follow least-privilege access. Production access requires hardware MFA and is logged and reviewed quarterly.'],
      ['Vulnerability disclosure', 'Found a bug? Email security@lumen.ai. We aim to respond within 24 hours and patch critical issues within 72 hours.'],
    ].map(([h,b])=>`
      <div style="margin-bottom:16px">
        <div style="font-weight:600;font-size:14px;margin-bottom:6px">${h}</div>
        <div style="font-size:13px;color:var(--ink-dim);line-height:1.7">${b}</div>
      </div>`).join('')}`,

  dpa: `
    <div class="modal-title" style="text-align:left;margin-bottom:4px">Data Processing Agreement</div>
    <div class="modal-subtitle" style="text-align:left;margin-bottom:20px">For GDPR-compliant organizations</div>
    <div style="font-size:14px;color:var(--ink-dim);line-height:1.8;margin-bottom:20px">Our standard DPA is available to all Studio plan customers and any organization processing personal data subject to GDPR. It covers our role as a data processor, sub-processors, and your rights as data controller.</div>
    ${[
      ['Sub-processors', 'AWS (hosting), Stripe (billing), Datadog (monitoring). Full list available on request.'],
      ['Data residency', 'EU customers can request data residency in eu-west-1 (Ireland). Contact support to enable.'],
      ['Retention', 'Data is retained for the duration of your subscription plus 30 days after cancellation, then securely deleted.'],
      ['SCCs', 'We execute Standard Contractual Clauses for any cross-border transfers of personal data.'],
    ].map(([h,b])=>`
      <div style="margin-bottom:16px;padding:14px 16px;background:rgba(139,122,255,0.06);border:1px solid var(--line);border-radius:12px">
        <div style="font-weight:600;font-size:13px;margin-bottom:5px">${h}</div>
        <div style="font-size:13px;color:var(--ink-dim);line-height:1.6">${b}</div>
      </div>`).join('')}
    <button class="btn btn-glass" style="width:100%;justify-content:center;margin-top:8px" onclick="showToast('DPA sent to your email', 'success')">Request signed DPA</button>`
};

function openEditorWithTemplate(templateName) {
  const starters = {
    'Essay draft': '# Essay Title\n\n## Introduction\n\n[Your thesis here]\n\n## Body\n\n[Develop your argument here]\n\n## Conclusion\n\n[Bring it home]',
    'Newsletter issue': '# Newsletter — Issue #\n\n**Opening line that makes them stay.**\n\n---\n\n## Main story\n\n[Your lead piece]\n\n## Quick takes\n\n- \n- \n- \n\n---\n\n*Until next time.*',
    'Product announcement': '# Introducing [Feature Name]\n\n[One-sentence hook]\n\n## What it does\n\n[Explain the feature in plain language]\n\n## Why it matters\n\n[The problem it solves]\n\n[Call to action]',
    'Research brief': '# Research Question\n\n## Methodology\n\n[How you approached the research]\n\n## Findings\n\n[Key results]\n\n## References\n\n1. ',
    'Short story': '# Story Title\n\n[Opening scene — ground the reader in a moment]\n\n[Rising tension]\n\n[The turn]\n\n[Resolution]',
    'Meeting notes': '# Meeting — [Date]\n\n**Attendees:** \n\n## Agenda\n\n1. \n\n## Decisions\n\n- \n\n## Action items\n\n| Task | Owner | Due |\n|------|-------|-----|\n| | | |'
  };
  if (!currentUser) { openAuthModal(); showToast('Sign in to use templates', 'info'); return; }
  const content = starters[templateName] || '';
  localStorage.setItem('lumen_draft', JSON.stringify({ title: templateName, content }));
  openEditor();
}

// ---- BIND FOOTER LINKS ----
function bindFooterLinks() {
  const map = {
    'Editor':       () => document.getElementById('editor')?.scrollIntoView({ behavior:'smooth' }),
    'Dashboard':    () => document.getElementById('dashboard')?.scrollIntoView({ behavior:'smooth' }),
    'Pricing':      () => document.getElementById('pricing')?.scrollIntoView({ behavior:'smooth' }),
    'Changelog':    () => openContentModal(footerContent.changelog),
    'Guides':       () => openContentModal(footerContent.guides),
    'Templates':    () => openContentModal(footerContent.templates),
    'Style models': () => openContentModal(footerContent.stylemodels),
    'API docs':     () => openContentModal(footerContent.apidocs),
    'About':        () => openContentModal(footerContent.about),
    'Journal':      () => openContentModal(footerContent.journal),
    'Careers':      () => openContentModal(footerContent.careers),
    'Press':        () => openContentModal(footerContent.press),
    'Privacy':      () => openContentModal(footerContent.privacy),
    'Terms':        () => openContentModal(footerContent.terms),
    'Security':     () => openContentModal(footerContent.security),
    'DPA':          () => openContentModal(footerContent.dpa),
  };
  document.querySelectorAll('.footer-col a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const label = a.textContent.trim();
      if (map[label]) map[label]();
    });
  });
}

// ---- BIND DASHBOARD BUTTONS ----
function bindDashboardButtons() {
  // Sidebar nav items
  document.querySelectorAll('.dash-nav li').forEach(li => {
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      const txt = li.textContent.trim().toLowerCase().replace(/\d+/g,'').trim();
      if (txt.includes('overview'))        switchDashView('overview');
      else if (txt.includes('drafts'))     switchDashView('drafts');
      else if (txt.includes('schedule'))   switchDashView('schedule');
      else if (txt.includes('comments'))   switchDashView('comments');
      else if (txt.includes('research'))   switchDashView('research');
      else if (txt.includes('personal'))   switchDashSpace('Personal Essays', ['Morning Reflections','On Solitude','The Art of Noticing']);
      else if (txt.includes('client'))     switchDashSpace('Client Work', ['Northline — Brand Story','Annual Report Copy','Product Launch Brief']);
      else if (txt.includes('novel'))      switchDashSpace('Novel — Vol II', ['Chapter 1: Arrival','Chapter 2: The Kitchen','Chapter 3: Silence','Chapter 4: Draft…']);
    });
  });
}

function switchDashView(view) {
  // hide all views
  ['overview','drafts','schedule','comments','research','space'].forEach(v => {
    const el = document.getElementById('dash-view-' + v);
    if (el) el.style.display = 'none';
  });
  // update active nav
  document.querySelectorAll('.dash-nav li').forEach(li => {
    const txt = li.textContent.trim().toLowerCase();
    li.classList.toggle('active', txt.includes(view === 'space' ? '📓' : view));
  });
  // show target
  const target = document.getElementById('dash-view-' + view);
  if (target) { target.style.display = 'block'; }

  // special logic per view
  if (view === 'drafts') renderDraftsList();
  if (view === 'overview') {
    const name = currentUser ? currentUser.name.split(' ')[0] : 'there';
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const el = document.getElementById('dashGreeting');
    if (el) el.innerHTML = greeting + ', <em>' + name + '</em>.';
  }
}

function switchDashSpace(title, docs) {
  switchDashView('space');
  const t = document.getElementById('space-title');
  if (t) t.textContent = title;
  const container = document.getElementById('space-docs');
  if (!container) return;
  container.innerHTML = docs.map((d,i) => `
    <div class="dash-card" style="cursor:pointer" onclick="openEditor();showToast('Opening: ${d}','info')">
      <div style="font-size:10px;color:var(--cyan-pulse);font-family:'JetBrains Mono',monospace;margin-bottom:8px">DOC ${i+1}</div>
      <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:6px">${d}</div>
      <div style="font-size:12px;color:var(--ink-faded)">Click to open in editor →</div>
    </div>`).join('') +
    `<div class="dash-card" style="cursor:pointer;border-style:dashed;display:flex;align-items:center;justify-content:center;min-height:100px;gap:8px;color:var(--ink-faded);font-size:13px" onclick="openEditor()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      New document
    </div>`;
}

function renderDraftsList() {
  const container = document.getElementById('drafts-list');
  if (!container) return;
  const saved = localStorage.getItem('lumen_draft');
  let drafts = [];
  if (saved) {
    try {
      const d = JSON.parse(saved);
      if (d.content) drafts.push(d);
    } catch(e) {}
  }
  if (drafts.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--ink-faded);font-family:'JetBrains Mono',monospace;font-size:13px">
      No drafts yet.<br><br>
      <button class="btn btn-primary" style="margin-top:8px" onclick="openEditor()">+ Start your first draft</button>
    </div>`;
    return;
  }
  container.innerHTML = drafts.map(d => `
    <div class="dash-card" style="cursor:pointer;margin-bottom:10px" onclick="openEditor()">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:4px">${d.title || 'Untitled draft'}</div>
          <div style="font-size:12px;color:var(--ink-faded);font-family:'JetBrains Mono',monospace">${d.content ? d.content.trim().split(/\s+/).length : 0} words</div>
        </div>
        <button class="btn btn-primary" style="padding:6px 14px;font-size:12px" onclick="event.stopPropagation();openEditor()">Open →</button>
      </div>
      <div style="font-size:13px;color:var(--ink-dim);margin-top:10px;line-height:1.5">${(d.content||'').slice(0,120)}${(d.content||'').length>120?'…':''}</div>
    </div>`).join('');
}

async function runResearch() {
  const q = document.getElementById('researchInput')?.value?.trim();
  if (!q) { showToast('Enter a research topic first', 'error'); return; }
  const btn = document.querySelector('#dash-view-research .btn-primary');
  if (btn) { btn.textContent = 'Searching…'; btn.disabled = true; }
  try {
    const result = await callLumen(
      [{ role: 'user', content: 'Find 3 academic-style sources for this topic and format each as: TITLE, Author — Journal, Year. Topic: ' + q }],
      'You are a research assistant. List exactly 3 concise source citations.'
    );
    const container = document.getElementById('researchResults');
    if (container) {
      const lines = result.split('\n').filter(l => l.trim());
      container.innerHTML = lines.slice(0,6).map((l,i) => `
        <div class="dash-card" style="cursor:pointer" onclick="showToast('Source copied!','success')">
          <div style="font-size:10px;color:var(--cyan-pulse);font-family:'JetBrains Mono',monospace;margin-bottom:6px">SOURCE ${i+1}</div>
          <div style="font-size:13px;color:var(--ink-dim)">${l.replace(/^\d+\.\s*/,'')}</div>
        </div>`).join('');
    }
    showToast('Research complete — ' + lines.length + ' sources found', 'success');
  } catch(e) {
    showToast('Server offline — run: node server.js', 'error');
  }
  if (btn) { btn.textContent = 'Research →'; btn.disabled = false; }
}

function toggleWeek(btn) {
  const options = ['This week', 'Last week', 'This month'];
  const cur = options.indexOf(btn.textContent);
  btn.textContent = options[(cur + 1) % options.length];
  showToast('Showing: ' + btn.textContent, 'info');
}

// run overview on load
document.addEventListener('DOMContentLoaded', () => switchDashView('overview'));

// ---- MODAL UTILS ----
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('authModalClose').addEventListener('click', () => closeModal('authModal'));
document.getElementById('authModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal('authModal');
});

// ---- AUTH TABS ----
function switchAuthTab(tab) {
  const isSignin = tab === 'signin';
  document.getElementById('signinForm').style.display = isSignin ? 'block' : 'none';
  document.getElementById('signupForm').style.display = isSignin ? 'none' : 'block';
  document.getElementById('tabSignin').classList.toggle('active', isSignin);
  document.getElementById('tabSignup').classList.toggle('active', !isSignin);
}

// ---- SIGN IN ----
function handleSignIn() {
  const email = document.getElementById('signinEmail').value.trim();
  const pass  = document.getElementById('signinPassword').value;
  if (!email || !pass) { showToast('Please fill all fields', 'error'); return; }
  const stored = JSON.parse(localStorage.getItem('lumen_user') || 'null');
  if (!stored || stored.email !== email) { showToast('No account found — try signing up', 'error'); return; }
  currentUser = stored;
  closeModal('authModal');
  updateNavForUser();
  showToast('Welcome back, ' + currentUser.name.split(' ')[0] + '!', 'success');
}

// ---- SIGN UP ----
function handleSignUp() {
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass  = document.getElementById('signupPassword').value;
  if (!name || !email || !pass) { showToast('Please fill all fields', 'error'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  currentUser = { name, email };
  localStorage.setItem('lumen_user', JSON.stringify(currentUser));
  closeModal('authModal');
  updateNavForUser();
  showToast('Welcome to Lumen, ' + name.split(' ')[0] + '!', 'success');
  setTimeout(openEditor, 700);
}

// ---- GOOGLE AUTH (simulated) ----
function handleGoogleAuth() {
  const names = ['Alex Morgan', 'Jamie Chen', 'Sam Rivera', 'Taylor Kim', 'Jordan Lee'];
  const name  = names[Math.floor(Math.random() * names.length)];
  currentUser = { name, email: name.toLowerCase().replace(' ', '.') + '@gmail.com' };
  localStorage.setItem('lumen_user', JSON.stringify(currentUser));
  closeModal('authModal');
  updateNavForUser();
  showToast('Signed in as ' + name.split(' ')[0], 'success');
  setTimeout(openEditor, 600);
}

// ---- SIGN OUT ----
function handleSignOut() {
  currentUser = null;
  localStorage.removeItem('lumen_user');
  location.reload();
}

// ---- EDITOR ----
function openEditor() {
  if (!currentUser) { switchAuthTab('signup'); openModal('authModal'); return; }
  document.getElementById('editorModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  const saved = localStorage.getItem('lumen_draft');
  if (saved) {
    try {
      const { title, content } = JSON.parse(saved);
      document.getElementById('editorTitle').value = title || '';
      document.getElementById('editorTextarea').value = content || '';
      updateWordCount();
    } catch(e) {}
  }
  setTimeout(() => document.getElementById('editorTextarea').focus(), 100);
}

function closeEditor() {
  saveDraft();
  document.getElementById('editorModal').classList.remove('open');
  document.body.style.overflow = '';
}

function saveDraft() {
  const title   = document.getElementById('editorTitle').value;
  const content = document.getElementById('editorTextarea').value;
  localStorage.setItem('lumen_draft', JSON.stringify({ title, content }));
  const s = document.getElementById('editorSaveStatus');
  if (s) { s.textContent = 'saved ✓'; setTimeout(() => { s.textContent = 'auto-saved'; }, 1800); }
}

function updateWordCount() {
  const text  = document.getElementById('editorTextarea').value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const el = document.getElementById('editorWordCount');
  if (el) el.textContent = words + ' word' + (words !== 1 ? 's' : '');
}

document.getElementById('editorTextarea').addEventListener('input', () => {
  updateWordCount();
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveDraft, 1400);
});
document.getElementById('editorTitle').addEventListener('input', () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveDraft, 1400);
});

function exportDoc() {
  const title   = document.getElementById('editorTitle').value || 'untitled';
  const content = document.getElementById('editorTextarea').value;
  const blob = new Blob(['# ' + title + '\n\n' + content], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/\s+/g, '-').toLowerCase() + '.md';
  a.click();
  showToast('Exported as Markdown', 'success');
}

// ---- AI ENGINE ----
async function callLumen(messages, system) {
  const res = await fetch(LUMEN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system })
  });
  if (!res.ok) throw new Error('API ' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content[0].text;
}

function showTyping() {
  const area = document.getElementById('aiResponseArea');
  removeEmpty(area);
  const el = document.createElement('div');
  el.className = 'typing-indicator'; el.id = 'typingIndicator';
  el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  area.prepend(el);
  area.scrollTop = 0;
}
function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}
function removeEmpty(area) {
  const empty = area.querySelector('.ai-empty-state');
  if (empty) empty.remove();
}

function addResponse(label, text, insertable) {
  const area = document.getElementById('aiResponseArea');
  removeEmpty(area);
  const el = document.createElement('div');
  el.className = 'ai-response-item';
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  el.innerHTML = `<div class="ai-response-label">${label}</div>
    <div class="ai-response-text">${escaped}</div>
    ${insertable !== false ? `<button class="ai-insert-btn" onclick="insertText(this, \`${text.replace(/`/g, '\\`')}\`)">↓ Insert into document</button>` : ''}`;
  area.prepend(el);
  area.scrollTop = 0;
}

function insertText(btn, text) {
  const ta  = document.getElementById('editorTextarea');
  const pos = ta.selectionEnd;
  const val = ta.value;
  const gap = (val[pos - 1] === '\n' || pos === 0) ? '' : '\n\n';
  ta.value = val.slice(0, pos) + gap + text + '\n\n' + val.slice(pos);
  ta.focus();
  updateWordCount();
  saveDraft();
  showToast('Inserted into document', 'success');
}

async function aiAction(type) {
  if (aiLoading) return;
  const text = document.getElementById('editorTextarea').value.trim();
  if (!text && type !== 'title') {
    showToast('First write something in the left area, then click this!', 'error');
    document.getElementById('editorTextarea').focus();
    return;
  }
  aiLoading = true;
  document.querySelectorAll('.ai-action-btn').forEach(b => b.classList.add('loading'));
  const paras = text.split(/\n\n+/);
  const last  = paras[paras.length - 1];
  const configs = {
    continue: {
      label: 'Continue',
      system: 'You are Lumen, an AI writing assistant. Continue the piece in the exact same voice, style, and tone. Write only the next 2-3 paragraphs. No preamble.',
      msg: 'Here is my writing so far:\n\n' + text + '\n\nContinue this piece naturally.'
    },
    improve: {
      label: 'Improved',
      system: 'You are Lumen, a writing editor. Rewrite the provided paragraph to be more elegant and precise. Maintain the writer\'s voice. Return only the rewritten paragraph.',
      msg: 'Improve this paragraph:\n\n' + last
    },
    shorter: {
      label: 'Shorter',
      system: 'You are Lumen. Rewrite this passage to be more concise. Keep the core ideas, cut the fat. Same voice. Return only the rewritten version.',
      msg: 'Make this shorter:\n\n' + last
    },
    title: {
      label: 'Title Ideas',
      system: 'You are a literary editor. Suggest 5 evocative, elegant titles for this piece. Format as a numbered list. No explanation.',
      msg: 'Suggest titles for:\n\n' + text
    }
  };
  const c = configs[type];
  showTyping();
  try {
    const result = await callLumen([{ role: 'user', content: c.msg }], c.system);
    hideTyping();
    addResponse(c.label, result, type !== 'title');
  } catch (e) {
    hideTyping();
    showToast('Server offline — run: node server.js', 'error');
  }
  document.querySelectorAll('.ai-action-btn').forEach(b => b.classList.remove('loading'));
  aiLoading = false;
}

async function askLumen() {
  if (aiLoading) return;
  const prompt = document.getElementById('aiPromptInput').value.trim();
  if (!prompt) { showToast('Enter a question first', 'error'); return; }
  const docText = document.getElementById('editorTextarea').value.trim();
  const context = docText ? '\n\nMy current document:\n\n' + docText : '';
  aiLoading = true;
  document.getElementById('aiPromptInput').value = '';
  showTyping();
  try {
    const result = await callLumen(
      [{ role: 'user', content: prompt + context }],
      'You are Lumen, an expert AI writing assistant. Be helpful, concise, and thoughtful.'
    );
    hideTyping();
    addResponse('Lumen', result);
  } catch (e) {
    hideTyping();
    showToast('Server offline — run: node server.js', 'error');
  }
  aiLoading = false;
}

document.getElementById('aiPromptInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); askLumen(); }
});

// ---- PRICING ----
let billingType = 'yearly';

function toggleBilling() {
  setBilling(billingType === 'yearly' ? 'monthly' : 'yearly');
}

function setBilling(type) {
  billingType = type;
  const knob = document.getElementById('billing-knob');
  const lblM = document.getElementById('lbl-monthly');
  const lblY = document.getElementById('lbl-yearly');
  const authorPrice = document.getElementById('author-price');
  const studioPrice = document.getElementById('studio-price');
  const authorPeriod = document.getElementById('author-period');
  const studioPeriod = document.getElementById('studio-period');

  if (type === 'monthly') {
    knob.style.left = '3px';
    lblM.style.color = 'var(--ink)';
    lblY.style.color = 'var(--ink-faded)';
    authorPrice.textContent = '25';
    studioPrice.textContent = '60';
    authorPeriod.textContent = 'per month · billed monthly';
    studioPeriod.textContent = 'per seat · billed monthly';
  } else {
    knob.style.left = '27px';
    lblM.style.color = 'var(--ink-faded)';
    lblY.style.color = 'var(--ink)';
    authorPrice.textContent = '18';
    studioPrice.textContent = '42';
    authorPeriod.textContent = 'per month · billed yearly';
    studioPeriod.textContent = 'per seat · billed yearly';
  }
}

function handlePlanClick(plan) {
  if (!currentUser) {
    openAuthModal();
    showToast('Sign in to choose a plan', 'info');
    return;
  }
  if (plan === 'drafter') {
    const saved = JSON.parse(localStorage.getItem('lumen_user') || '{}');
    saved.plan = 'drafter';
    localStorage.setItem('lumen_user', JSON.stringify(saved));
    currentUser = saved;
    updateCurrentPlanBadges();
    showToast('You are on the Drafter plan — free forever!', 'success');
  } else if (plan === 'author') {
    openUpgradeModal();
  } else if (plan === 'studio') {
    openContactModal();
  }
}

function updateCurrentPlanBadges() {
  const plan = currentUser && currentUser.plan ? currentUser.plan : 'drafter';
  ['drafter','author','studio'].forEach(p => {
    const el = document.getElementById('current-' + p);
    if (el) el.style.display = p === plan ? 'block' : 'none';
  });
}

function openUpgradeModal() {
  const price = billingType === 'yearly' ? '18' : '25';
  const note = billingType === 'yearly' ? 'Billed yearly · $216 total' : 'Billed monthly';
  document.getElementById('upgrade-price-display').textContent = price;
  document.getElementById('upgrade-billing-note').textContent = note;
  document.getElementById('upgradeModal').classList.add('open');
}
function closeUpgradeModal() {
  document.getElementById('upgradeModal').classList.remove('open');
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2);
  input.value = v;
}

function confirmUpgrade() {
  const name = document.getElementById('cardName').value.trim();
  const num = document.getElementById('cardNumber').value.replace(/\s/g,'');
  const exp = document.getElementById('cardExpiry').value.trim();
  const cvc = document.getElementById('cardCvc').value.trim();
  if (!name) { showToast('Enter cardholder name', 'error'); return; }
  if (num.length < 16) { showToast('Enter a valid card number', 'error'); return; }
  if (exp.length < 7) { showToast('Enter expiry date', 'error'); return; }
  if (cvc.length < 3) { showToast('Enter CVC', 'error'); return; }

  const btn = document.getElementById('upgrade-btn-text');
  btn.textContent = 'Processing…';
  setTimeout(() => {
    const saved = JSON.parse(localStorage.getItem('lumen_user') || '{}');
    saved.plan = 'author';
    localStorage.setItem('lumen_user', JSON.stringify(saved));
    currentUser = saved;
    closeUpgradeModal();
    updateCurrentPlanBadges();
    showToast('Welcome to Author! Enjoy the full Lumen experience.', 'success');
    btn.textContent = 'Confirm & Upgrade';
  }, 1800);
}

function openContactModal() {
  if (currentUser) {
    document.getElementById('studioEmail').value = currentUser.email || '';
    document.getElementById('studioName').value = currentUser.name || '';
  }
  document.getElementById('contactModal').classList.add('open');
}
function closeContactModal() {
  document.getElementById('contactModal').classList.remove('open');
}

function submitContact() {
  const name = document.getElementById('studioName').value.trim();
  const email = document.getElementById('studioEmail').value.trim();
  const company = document.getElementById('studioCompany').value.trim();
  const size = document.getElementById('studioSize').value;
  if (!name) { showToast('Enter your name', 'error'); return; }
  if (!email || !email.includes('@')) { showToast('Enter a valid email', 'error'); return; }
  if (!company) { showToast('Enter your company name', 'error'); return; }
  if (!size) { showToast('Select your team size', 'error'); return; }
  closeContactModal();
  showToast("Thanks, " + name + "! We'll reach out within 24 hours.", 'success');
}

// Close pricing modals on overlay click
document.getElementById('upgradeModal').addEventListener('click', function(e) {
  if (e.target === this) closeUpgradeModal();
});
document.getElementById('contactModal').addEventListener('click', function(e) {
  if (e.target === this) closeContactModal();
});

// Init billing display + plan badges on load
(function initPricing() {
  setBilling('yearly');
  if (currentUser) updateCurrentPlanBadges();
})();

// ---- TOAST ----
function showToast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: '→' };
  const colors = { success: '#7fe7ff', error: '#ff8e8e', info: 'var(--violet-soft)' };
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<span style="color:${colors[type]}">${icons[type]}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s, transform 0.3s';
    t.style.opacity = '0'; t.style.transform = 'translateY(8px)';
    setTimeout(() => t.remove(), 320);
  }, 3000);
}
