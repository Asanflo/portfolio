// ---- Theme toggle ----
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('portfolio-theme');
  if (saved) root.setAttribute('data-theme', saved);
  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  // ---- Hamburger / mobile panel ----
  const hamburger = document.getElementById('hamburger');
  const mobilePanel = document.getElementById('mobilePanel');
  hamburger.addEventListener('click', () => {
    const isOpen = mobilePanel.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  document.querySelectorAll('.mp-link').forEach(link => {
    link.addEventListener('click', () => {
      mobilePanel.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });


  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  function buildKnowledgeBase(){
  const kb = { projects: [], skills: [], parcours: [], about: [], contact: '' };

  document.querySelectorAll('#projects .project-card').forEach(card => {
    const title = card.querySelector('.project-title')?.textContent.trim();
    const desc = card.querySelector('.project-desc')?.textContent.trim();
    const tags = [...card.querySelectorAll('.tag')].map(t => t.textContent.trim()).join(', ');
    if (title) kb.projects.push({ title, text: `${title} — ${desc}${tags ? ' Technos : ' + tags + '.' : ''}` });
  });

  document.querySelectorAll('#skills .skills-category').forEach(cat => {
    const label = cat.querySelector('.skills-category-label')?.textContent.trim();
    const items = [...cat.querySelectorAll('.skill-chip span')].map(s => s.textContent.trim()).join(', ');
    if (label) kb.skills.push(`${label} : ${items}.`);
  });

  document.querySelectorAll('#parcours .timeline-group').forEach(group => {
    const label = group.querySelector('.timeline-label')?.textContent.trim();
    const items = [...group.querySelectorAll('.timeline-item')].map(item => {
      const h = item.querySelector('h4')?.textContent.trim() || '';
      const p = item.querySelector('p')?.textContent.trim() || '';
      const meta = item.querySelector('.timeline-meta')?.textContent.trim();
      return `${h}${p ? ' (' + p + ')' : ''}${meta ? ' — ' + meta : ''}`;
    });
    if (label) kb.parcours.push(`${label} : ${items.join(' · ')}`);
  });

  document.querySelectorAll('#knowme .knowme-text p').forEach(p => kb.about.push(p.textContent.trim()));

  const email = document.querySelector('#contact a[href^="mailto:"]')?.textContent.trim();
  const phone = document.querySelector('#contact a[href^="tel:"]')?.textContent.trim();
  const loc = document.querySelectorAll('#contact .contact-info-item span')[0]?.textContent.trim();
  kb.contact = `Email : ${email || 'voir section Contact'}. Téléphone : ${phone || 'voir section Contact'}. Basé à ${loc || 'Douala, Cameroun'}.`;

  return kb;
}

function knowledgeBaseToText(kb){
  return [
    'PROJETS:', ...kb.projects.map(p => '- ' + p.text),
    'COMPÉTENCES:', ...kb.skills,
    'PARCOURS:', ...kb.parcours,
    'À PROPOS:', ...kb.about,
    'CONTACT:', kb.contact
  ].join('\n');
}

const KB = buildKnowledgeBase();

  function addMessage(text, from){
    const div = document.createElement('div');
    div.className = 'msg ' + from;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function respond(query){
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, context: knowledgeBaseToText(KB) })
    });

    const data = await res.json();
    console.log("API RESPONSE:", data);

    if (!res.ok) {
      addMessage("Erreur API : " + (data.error || "inconnue"), "bot");
      return;
    }

    addMessage(data.reply, "bot");
  } catch (err) {
    addMessage("Connexion au serveur impossible pour le moment.", 'bot');
  }
}

  function sendMessage(){
    const val = chatInput.value.trim();
    if (!val) return;
    addMessage(val, 'user');
    chatInput.value = '';
    respond(val);
  }

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const labels = { projets: 'Ses projets ?', stack: 'Sa stack technique ?', etudes: 'Son parcours ?' };
      addMessage(labels[q], 'user');
      respond(q);
    });
  });