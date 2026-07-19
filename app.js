'use strict';

const tenses = ['presente', 'pretérito perfeito', 'futuro'];
const locale = 'pt-BR';

let tenseState = {};
let verbState = {};
let currentProblem = null;
let settingsRendered = false;

function numberToLetters(n) {
  let result = '';
  while (n >= 0) {
    const remainder = n % 26;
    result = String.fromCharCode(remainder + 97) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeAnswer(text) {
  return text.normalize('NFD').trim().toLocaleLowerCase(locale);
}

function stripDiacritics(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  const tensesParam = params.get('tenses');
  const verbsParam = params.get('verbs');

  if (tensesParam) {
    const tenseList = tensesParam.split(',').map(t => t.trim().toLowerCase());
    for (const tense of tenses) {
      tenseState[tense] = tenseList.includes(tense);
    }
  } else {
    for (const tense of tenses) {
      tenseState[tense] = true;
    }
  }

  if (verbsParam) {
    const verbList = verbsParam.split(',').map(v => v.trim().toLowerCase());
    for (const verb of allVerbs) {
      verbState[verb] = verbList.includes(verb.toLowerCase());
    }
  } else {
    for (const verb of allVerbs) {
      verbState[verb] = true;
    }
  }
}

function getFilteredProblems() {
  const anyVerbSelected = allVerbs.some(v => verbState[v]);
  const anyTenseSelected = tenses.some(t => tenseState[t]);

  return problemData.filter(p => {
    const tenseMatch = !anyTenseSelected || tenseState[p.tense];
    const verbMatch = !anyVerbSelected || (verbState[p.verb] ?? true);
    return tenseMatch && verbMatch;
  });
}

function makeSentenceHTML(sentence) {
  const arbitraryKeywords = {};
  let placeholderIndex = 0;

  sentence = sentence.replace(/\[([^\]]+)\]/g, (_, phrase) => {
    const placeholder = `arbitrarykeyword${numberToLetters(placeholderIndex++)}`;
    arbitraryKeywords[placeholder] = phrase.toLocaleLowerCase(locale);
    return placeholder;
  });

  const words = sentence.split(' ');
  const parts = [];

  words.forEach((word, index) => {
    const match = word.match(/(\p{L}+)(\p{P}*)/u);
    let actualWord = match ? match[1].toLocaleLowerCase(locale) : word;
    const punctuation = match ? match[2] : '';

    const arbitraryKeyword = arbitraryKeywords[actualWord];
    if (arbitraryKeyword) actualWord = arbitraryKeyword;

    if (word === '{blank}') {
      parts.push('<input class="answer-input" id="answerInput" type="text" autocapitalize="none" autocomplete="off">');
    } else if (keywordsData[actualWord]) {
      const def = keywordsData[actualWord];
      parts.push(
        `<span class="tooltip-wrapper">` +
        `<span class="tooltip-trigger">${escapeHTML(actualWord)}</span>` +
        `<div class="tooltip-box"><strong>${escapeHTML(actualWord)}:</strong> ${escapeHTML(def.description)}</div>` +
        `</span>${escapeHTML(punctuation)}`
      );
    } else {
      parts.push(escapeHTML(word));
    }

    if (index < words.length - 1) parts.push(' ');
  });

  return parts.join('');
}

function makeVerbTooltipHTML(verb) {
  const def = verbsDictionaryData[verb];
  if (!def) return escapeHTML(verb);
  return (
    `<span class="tooltip-wrapper">` +
    `<span class="tooltip-trigger">${escapeHTML(verb)}</span>` +
    `<div class="tooltip-box"><strong>${escapeHTML(verb)}:</strong> ${escapeHTML(def.description)}</div>` +
    `</span>`
  );
}

function getNewProblem() {
  const filtered = getFilteredProblems();
  if (filtered.length === 0) return;

  currentProblem = filtered[Math.floor(Math.random() * filtered.length)];

  document.getElementById('verb-display').innerHTML = makeVerbTooltipHTML(currentProblem.verb);
  document.getElementById('sentence-container').innerHTML = makeSentenceHTML(currentProblem.sentence);
  document.getElementById('tense-display').textContent = `(${currentProblem.tense})`;

  const input = document.getElementById('answerInput');
  if (input) {
    input.value = '';
    input.focus();
  }

  hideFeedback();
  updateProblemCount();
}

function checkAnswer(event) {
  if (event) event.preventDefault();
  if (!currentProblem) return;

  const input = document.getElementById('answerInput');
  if (!input) return;

  const userAnswer = input.value;
  const { answers } = currentProblem;

  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = answers.map(normalizeAnswer);

  const isCorrect = normalizedCorrect.includes(normalizedUser);
  const isAlmostCorrect = !isCorrect && normalizedCorrect.some(
    a => stripDiacritics(a) === stripDiacritics(userAnswer.trim().toLowerCase())
  );

  if (isCorrect) showFeedback('success');
  else if (isAlmostCorrect) showFeedback('almost');
  else showFeedback('failure');
}

function showFeedback(result) {
  const happyEmojis = ['😊', '😃', '🥳', '😄', '🎉'];
  const sadEmojis = ['😢', '😞', '😔', '🙁', '😟'];

  let emoji, titleText;
  if (result === 'success') {
    emoji = happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
    titleText = 'Mandou bem!';
  } else if (result === 'almost') {
    emoji = happyEmojis[Math.floor(Math.random() * happyEmojis.length)];
    titleText = 'Quase!';
  } else {
    emoji = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];
    titleText = 'Tente novamente!';
  }

  document.getElementById('feedback-title').textContent = `${titleText} ${emoji}`;

  const revealedEl = document.getElementById('feedback-revealed');
  revealedEl.textContent = '';
  revealedEl.classList.add('hidden');

  const revealBtn = document.getElementById('reveal-btn');
  const tryAgainBtn = document.getElementById('try-again-btn');
  const nextBtn = document.getElementById('next-btn');

  if (result === 'success') {
    revealBtn.classList.add('hidden');
    tryAgainBtn.classList.add('hidden');
    nextBtn.focus();
  } else {
    revealBtn.classList.remove('hidden');
    tryAgainBtn.classList.remove('hidden');
    tryAgainBtn.focus();
  }

  document.getElementById('feedback-overlay').classList.remove('hidden');
}

function hideFeedback() {
  document.getElementById('feedback-overlay').classList.add('hidden');
}

function revealAnswer() {
  const answer = currentProblem.answers.join('/');
  const revealedEl = document.getElementById('feedback-revealed');
  revealedEl.textContent = `A resposta correta é: “${answer}”`;
  revealedEl.classList.remove('hidden');
  document.getElementById('reveal-btn').classList.add('hidden');
}

function updateProblemCount() {
  document.getElementById('problem-count').textContent = `${getFilteredProblems().length} frases`;
}

// Settings

function toggleSettings() {
  const menu = document.getElementById('settings-menu');
  const isHidden = menu.classList.contains('hidden');

  if (isHidden) {
    menu.classList.remove('hidden');
    if (!settingsRendered) {
      renderSettingsMenu();
      settingsRendered = true;
    }
    updateSettingsLink();
  } else {
    menu.classList.add('hidden');
  }
}

function renderSettingsMenu() {
  const menu = document.getElementById('settings-menu');

  let html = '<div class="settings-content" id="settings-content">';
  html += '<div class="link-row"><span id="settings-link-text" class="link-text"></span></div>';
  html += '<button type="button" id="copy-link-btn">copiar link</button>';

  html += '<h4>Filtrar Tempos Verbais:</h4>';
  html += '<div class="toggle-container">';
  for (const tense of tenses) {
    html += `<div class="toggle"><label><input type="checkbox" data-tense="${escapeHTML(tense)}"${tenseState[tense] ? ' checked' : ''}> ${escapeHTML(tense)}</label></div>`;
  }
  html += '</div>';

  html += '<h4>Filtrar Verbos:</h4>';
  html += '<div class="verb-toolbar">';
  html += '<input type="search" id="verb-search" placeholder="Buscar verbo..." autocomplete="off">';
  html += '<div class="verb-toolbar-actions">';
  html += '<button type="button" id="select-all-btn">marcar todos</button>';
  html += '<button type="button" id="deselect-all-btn">desmarcar todos</button>';
  html += '<span id="verb-count"></span>';
  html += '</div>';
  html += '</div>';

  html += '<div class="chip-container" id="verb-chip-container">';
  for (const verb of allVerbs) {
    html += `<button type="button" class="chip" data-verb="${escapeHTML(verb)}" aria-pressed="${verbState[verb] ? 'true' : 'false'}">${escapeHTML(verb)}</button>`;
  }
  html += '</div>';
  html += '<p id="verb-no-match" class="hidden">Nenhum verbo encontrado.</p>';

  html += '</div>';
  menu.innerHTML = html;

  document.getElementById('settings-content').addEventListener('change', e => {
    const target = e.target;
    if (target.dataset.tense) {
      tenseState[target.dataset.tense] = target.checked;
      updateSettingsLink();
      updateProblemCount();
    }
  });

  document.getElementById('verb-chip-container').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const verb = chip.dataset.verb;
    const selected = chip.getAttribute('aria-pressed') !== 'true';
    chip.setAttribute('aria-pressed', String(selected));
    verbState[verb] = selected;
    updateVerbCount();
    updateSettingsLink();
    updateProblemCount();
  });

  document.getElementById('copy-link-btn').addEventListener('click', copyLink);

  document.getElementById('select-all-btn').addEventListener('click', () => {
    for (const verb of allVerbs) verbState[verb] = true;
    document.querySelectorAll('#verb-chip-container .chip').forEach(chip => chip.setAttribute('aria-pressed', 'true'));
    updateVerbCount();
    updateSettingsLink();
    updateProblemCount();
  });

  document.getElementById('deselect-all-btn').addEventListener('click', () => {
    for (const verb of allVerbs) verbState[verb] = false;
    document.querySelectorAll('#verb-chip-container .chip').forEach(chip => chip.setAttribute('aria-pressed', 'false'));
    updateVerbCount();
    updateSettingsLink();
    updateProblemCount();
  });

  document.getElementById('verb-search').addEventListener('input', e => {
    filterVerbChips(e.target.value);
  });

  updateVerbCount();
  updateSettingsLink();
}

function filterVerbChips(query) {
  const needle = stripDiacritics(query.trim().toLowerCase());
  const chips = document.querySelectorAll('#verb-chip-container .chip');
  let anyVisible = false;

  chips.forEach(chip => {
    const haystack = stripDiacritics(chip.dataset.verb.toLowerCase());
    const matches = !needle || haystack.includes(needle);
    chip.classList.toggle('chip-hidden', !matches);
    if (matches) anyVisible = true;
  });

  document.getElementById('verb-no-match').classList.toggle('hidden', anyVisible);
}

function updateVerbCount() {
  const countEl = document.getElementById('verb-count');
  if (!countEl) return;
  const selected = allVerbs.filter(v => verbState[v]).length;
  countEl.textContent = `${selected}/${allVerbs.length} selecionados`;
}

function updateSettingsLink() {
  const el = document.getElementById('settings-link-text');
  if (!el) return;
  const link = createLink();
  el.textContent = link;
  el.title = link;
}

function createLink() {
  let verbQuery = [];
  let hasAllVerbs = true;
  for (const verb of allVerbs) {
    if (verbState[verb]) verbQuery.push(verb);
    else hasAllVerbs = false;
  }

  let tenseQuery = [];
  let hasAllTenses = true;
  for (const tense of tenses) {
    if (tenseState[tense]) tenseQuery.push(tense);
    else hasAllTenses = false;
  }

  const queryItems = [];
  if (!hasAllTenses && tenseQuery.length > 0) queryItems.push(`tenses=${tenseQuery.join(',')}`);
  if (!hasAllVerbs && verbQuery.length > 0) queryItems.push(`verbs=${verbQuery.join(',')}`);

  const qs = queryItems.length ? `?${queryItems.join('&')}` : '';
  return `${window.location.origin}${window.location.pathname}${qs}`;
}

function copyLink() {
  navigator.clipboard.writeText(createLink());
}

// Initialize

document.addEventListener('DOMContentLoaded', () => {
  initFromURL();

  document.getElementById('check-btn').addEventListener('click', () => checkAnswer());
  document.getElementById('new-btn').addEventListener('click', () => getNewProblem());
  document.getElementById('main-form').addEventListener('submit', e => checkAnswer(e));
  document.getElementById('settings-btn').addEventListener('click', () => toggleSettings());
  document.getElementById('reveal-btn').addEventListener('click', () => revealAnswer());
  document.getElementById('try-again-btn').addEventListener('click', () => {
    hideFeedback();
    const input = document.getElementById('answerInput');
    if (input) input.focus();
  });
  document.getElementById('next-btn').addEventListener('click', () => getNewProblem());

  getNewProblem();
});
