function weightedVal(v) {
    // For Discours & Attitude: skip value 4 (shift 4-8 to 5-8)
    // Actually per the guide: positions 1-3 = 1-3, 4 skipped, 5-8 = 5-8
    if (v <= 3) return v;
    return v + 1; // 4→5, 5→6, 6→7, 7→8 (max position gives 8, shifted to 9 — cap at 8)
  }

  const personalityTable = [
    // rows: MD sum 2→16, cols: EA sum 2→16
    //     2          3-4         5-6        7-8       9-10     11-12    13-14     15-16
    ["Calme",    "Calme",    "Facile",   "Facile",  "Souple", "Souple","Joyeux", "Joyeux"],   // MD=2
    ["Calme",    "Calme",    "Facile",   "Facile",  "Souple", "Souple","Joyeux", "Joyeux"],   // MD=3
    ["Calme",    "Calme",    "Facile",   "Souple",  "Souple", "Joyeux","Joyeux", "Énergique"],// MD=4
    ["Calme",    "Réservé",  "Facile",   "Souple",  "Joyeux", "Joyeux","Énergique","Énergique"],//5
    ["Réservé",  "Réservé",  "Facile",   "Souple",  "Joyeux", "Joyeux","Énergique","Passionné"],//6
    ["Réservé",  "Réservé",  "Appliqué", "Souple",  "Joyeux", "Énergique","Passionné","Passionné"],//7
    ["Réservé",  "Appliqué", "Appliqué", "Appliqué","Souple","Énergique","Passionné","Charismatique"],//8
    ["Appliqué", "Appliqué", "Appliqué", "Souple",  "Énergique","Passionné","Charismatique","Charismatique"],//9
    ["Appliqué", "Appliqué", "Perfectionniste","Perfectionniste","Passionné","Passionné","Charismatique","Meneur"],//10
    ["Appliqué", "Perfectionniste","Perfectionniste","Perfectionniste","Passionné","Charismatique","Meneur","Meneur"],//11
    ["Perfectionniste","Perfectionniste","Perfectionniste","Perfectionniste","Charismatique","Meneur","Meneur","Aventureux"],//12
    ["Perfectionniste","Perfectionniste","Perfectionniste","Charismatique","Meneur","Meneur","Aventureux","Aventureux"],//13
    ["Perfectionniste","Perfectionniste","Charismatique","Meneur","Meneur","Aventureux","Aventureux","Excentrique"],//14
    ["Perfectionniste","Charismatique","Meneur","Meneur","Aventureux","Aventureux","Excentrique","Excentrique"],//15
    ["Charismatique","Meneur","Meneur","Aventureux","Aventureux","Excentrique","Excentrique","Excentrique"],//16
  ];

  function getPersonality(mouvement, discours, energie, attitude) {
    // Discours & Attitude: skip 4
    const d = discours <= 3 ? discours : discours + 1;
    const a = attitude <= 3 ? attitude : attitude + 1;
    const md = Math.min(16, Math.max(2, mouvement + d));
    const ea = Math.min(16, Math.max(2, energie + a));
    const row = Math.min(14, md - 2);
    // Map ea (2-16) to col index 0-7
    const col = Math.min(7, Math.floor((ea - 2) / 1.875));
    return personalityTable[row][col];
  }

  // ── Slider live update ──────────────────────────────────────────
  document.querySelectorAll('.pers-slider').forEach(slider => {
    slider.addEventListener('input', () => {
      const id = slider.id.replace('trait-', '');
      document.getElementById('tv-' + id).textContent = slider.value;
      updatePersonality();
    });
  });

  function updatePersonality() {
    const m = parseInt(document.getElementById('trait-mouvement').value);
    const d = parseInt(document.getElementById('trait-discours').value);
    const e = parseInt(document.getElementById('trait-energie').value);
    const a = parseInt(document.getElementById('trait-attitude').value);
    const g = parseInt(document.getElementById('trait-global').value);
    const type = getPersonality(m, d, e, a);
    const globalLabel = g <= 3 ? '(normal)' : g >= 6 ? '(très excentrique)' : '(légèrement excentrique)';
    document.getElementById('personality-result').innerHTML =
      `✨ Type de personnalité prédit : <strong>${type}</strong> ${globalLabel}`;
  }
  updatePersonality();

  // ── Helper getters ──────────────────────────────────────────────
  function getVal(id) { return document.getElementById(id)?.value?.trim() || '—'; }
  function getRadio(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '—';
  }
  function getChecked(name) {
    const els = document.querySelectorAll(`input[name="${name}"]:checked`);
    return els.length ? [...els].map(e => e.value).join(', ') : '—';
  }
  function sliderLabel(id, left, right) {
    const v = parseInt(document.getElementById(id).value);
    if (v <= 2) return `${left} (${v}/8)`;
    if (v >= 7) return `${right} (${v}/8)`;
    return `${v}/8`;
  }

  // ── Generate summary ────────────────────────────────────────────
  function generateSummary() {
    const m = parseInt(document.getElementById('trait-mouvement').value);
    const d = parseInt(document.getElementById('trait-discours').value);
    const e = parseInt(document.getElementById('trait-energie').value);
    const a = parseInt(document.getElementById('trait-attitude').value);
    const g = parseInt(document.getElementById('trait-global').value);
    const personality = getPersonality(m, d, e, a);

    const birthday = document.getElementById('birthday').value;
    let bdDisplay = '—';
    if (birthday) {
      const dt = new Date(birthday + 'T00:00:00');
      bdDisplay = dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const items = [
      { label: '👤 Prénom', value: getVal('name') },
      { label: '🎂 Anniversaire', value: bdDisplay },
      { label: '⚧ Genre', value: getRadio('genre') },
      { label: '🗣️ Pronoms', value: getRadio('pronoms') },
      { label: '💖 Préférences', value: getChecked('pref') },
      { label: '👗 Tenue événements', value: getRadio('tenue') },
      { label: '🔊 Voix (hauteur)', value: sliderLabel('voice-pitch', 'Grave', 'Aiguë') },
      { label: '🎶 Voix (intonation)', value: sliderLabel('voice-tone', 'Neutre', 'Chantante') },
      { label: '🏃 Mouvement', value: sliderLabel('trait-mouvement', 'Lent', 'Rapide') },
      { label: '💬 Discours', value: sliderLabel('trait-discours', 'Poli', 'Direct') },
      { label: '⚡ Énergie', value: sliderLabel('trait-energie', 'Plat', 'Intense') },
      { label: '😌 Attitude', value: sliderLabel('trait-attitude', 'Sérieux', 'Décontracté') },
      { label: '🌈 Global', value: sliderLabel('trait-global', 'Normal', 'Excentrique') },
    ];

    const grid = document.getElementById('summary-grid');
    grid.innerHTML = items.map(i => `
      <div class="summary-item">
        <div class="s-label">${i.label}</div>
        <div class="s-value">${i.value}</div>
      </div>
    `).join('') + `
      <div class="summary-item summary-personality">
        <div class="s-label">🧠 Type de personnalité</div>
        <div class="s-value">${personality}</div>
      </div>
    `;

    const section = document.getElementById('summary-section');
    section.classList.add('visible');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Copy as text ────────────────────────────────────────────────
  function copyText() {
    generateSummary();
    const items = [...document.querySelectorAll('.summary-item')];
    const lines = items.map(el => {
      const lbl = el.querySelector('.s-label')?.textContent || '';
      const val = el.querySelector('.s-value')?.textContent || '';
      return `${lbl} : ${val}`;
    });
    const text = `🏝️ Fiche Mii — Tomodachi Life : Une vie de rêve\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Fiche copiée dans le presse-papier !');
    }).catch(() => {
      prompt('Copie manuellement :', text);
    });
  }

  // ── Reset ───────────────────────────────────────────────────────
  function resetForm() {
    if (!confirm('Réinitialiser tous les champs ?')) return;
    document.getElementById('name').value = '';
    document.getElementById('birthday').value = '';
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    ['voice-pitch','voice-tone','trait-mouvement','trait-discours','trait-energie','trait-attitude','trait-global'].forEach(id => {
      document.getElementById(id).value = 4;
    });
    document.getElementById('vp-val').textContent = '4';
    document.getElementById('vt-val').textContent = '4';
    ['mouvement','discours','energie','attitude','global'].forEach(t => {
      document.getElementById('tv-' + t).textContent = '4';
    });
    document.getElementById('summary-section').classList.remove('visible');
    updatePersonality();
  }