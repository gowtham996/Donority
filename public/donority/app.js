// Donority — Vanilla JS SPA with LocalStorage
// All data persists to LocalStorage; falls back to in-memory if unavailable.

const STORAGE_KEYS = {
  ngos: 'donority_ngos',
  causes: 'donority_causes',
  donations: 'donority_donations',
  currentUser: 'donority_current_user',
};

let MEMORY_STORE = { ngos: [], causes: [], donations: [], currentUser: null };
let useMemory = false;

function storageAvailable() {
  try {
    const x = '__donority_test__';
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch (e) {
    console.warn('LocalStorage unavailable, falling back to memory store', e);
    return false;
  }
}

function getData(key) {
  if (useMemory) return structuredClone(MEMORY_STORE[key] ?? null);
  const raw = localStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : (key === STORAGE_KEYS.currentUser ? null : []);
  } catch (e) {
    console.error('Failed parsing LocalStorage for', key, e);
    return key === STORAGE_KEYS.currentUser ? null : [];
  }
}

function setData(key, value) {
  if (useMemory) {
    MEMORY_STORE[key] = structuredClone(value);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed writing LocalStorage for', key, e);
  }
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

function formatCurrency(num) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);
}

function formatCompact(num) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(num || 0);
}

// Sample data
function preloadSampleData() {
  const ngos = getData(STORAGE_KEYS.ngos);
  const causes = getData(STORAGE_KEYS.causes);

  if (!ngos.length) {
    const sampleNgo = {
      id: 'ngo_1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '123',
      orgName: 'Helping Hands',
    };
    setData(STORAGE_KEYS.ngos, [sampleNgo]);
  }

  if (!causes.length) {
    const sample = [
      {
        id: 'cause_1',
        ngoId: 'ngo_1',
        title: 'Help Build a School',
        description: 'Construct classrooms and provide learning materials for 500+ children.',
        category: 'Education',
        targetAmount: 50000,
        raisedAmount: 12000,
        image: './images/cause-education.jpg',
      },
      {
        id: 'cause_2',
        ngoId: 'ngo_1',
        title: 'Emergency Medical Kits',
        description: 'Distribute essential medical kits to rural clinics.',
        category: 'Health',
        targetAmount: 30000,
        raisedAmount: 8000,
        image: './images/cause-health.jpg',
      },
      {
        id: 'cause_3',
        ngoId: 'ngo_1',
        title: 'Plant 50,000 Trees',
        description: 'Reforest degraded land to restore ecosystems.',
        category: 'Environment',
        targetAmount: 40000,
        raisedAmount: 22000,
        image: './images/cause-environment.jpg',
      },
      {
        id: 'cause_4',
        ngoId: 'ngo_1',
        title: 'Rapid Disaster Relief Fund',
        description: 'Food, shelter, and hygiene kits for disaster-affected families.',
        category: 'Disaster Relief',
        targetAmount: 60000,
        raisedAmount: 15000,
        image: './images/cause-disaster.jpg',
      },
    ];
    setData(STORAGE_KEYS.causes, sample);
  }

  // Ensure donations exists
  if (!getData(STORAGE_KEYS.donations).length) setData(STORAGE_KEYS.donations, []);
}

// UI rendering
const CATEGORIES = ['Health', 'Education', 'Environment', 'Disaster Relief'];
const CATEGORY_IMAGES = {
  Health: './images/cause-health.jpg',
  Education: './images/cause-education.jpg',
  Environment: './images/cause-environment.jpg',
  'Disaster Relief': './images/cause-disaster.jpg',
};

function computeTotals() {
  const causes = getData(STORAGE_KEYS.causes);
  const totalRaised = causes.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalTarget = causes.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
  return { totalRaised, totalTarget };
}

function renderHeroStats() {
  const el = document.getElementById('heroTotalRaised');
  if (!el) return;
  const { totalRaised } = computeTotals();
  el.textContent = `${formatCurrency(totalRaised)} (${formatCompact(totalRaised)})`;
}

function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const tile = document.createElement('button');
    tile.className = 'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left hover:shadow-lg transition';
    const imgSrc = CATEGORY_IMAGES[cat] || `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(cat)}`;
    tile.innerHTML = `
      <div class="aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 mb-4">
        <img src="${imgSrc}" alt="${cat} charity initiatives — Donority" class="h-full w-full object-cover" loading="lazy"/>
      </div>
      <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-brand/5 opacity-0 group-hover:opacity-100 transition"></div>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">${cat}</h3>
        <span class="h-10 w-10 grid place-items-center rounded-full bg-brand/10 text-brand">★</span>
      </div>
      <p class="mt-2 text-sm text-gray-600">Explore ${cat.toLowerCase()} initiatives.</p>
      <span class="mt-4 inline-flex items-center text-brand group-hover:underline">View causes →</span>
    `;
    tile.addEventListener('click', () => applyFilter(cat));
    grid.appendChild(tile);
  });
}

let activeFilter = 'All';

function renderFilters() {
  const bar = document.getElementById('filterBar');
  bar.innerHTML = '';
  const makeBtn = (label) => {
    const btn = document.createElement('button');
    const isActive = activeFilter === label;
    btn.className = `rounded-full border px-3 py-1.5 text-sm ${isActive ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    btn.textContent = label;
    btn.addEventListener('click', () => applyFilter(label));
    return btn;
  };
  bar.appendChild(makeBtn('All'));
  CATEGORIES.forEach((c) => bar.appendChild(makeBtn(c)));
}

function applyFilter(filterLabel) {
  activeFilter = filterLabel;
  renderFilters();
  renderCauses();
  // Scroll to list when filtering from categories
  document.getElementById('causes').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCauses() {
  const list = document.getElementById('causeList');
  const empty = document.getElementById('emptyState');
  const data = getData(STORAGE_KEYS.causes);
  const causes = activeFilter === 'All' ? data : data.filter((c) => c.category === activeFilter);

  list.innerHTML = '';
  if (!causes.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  causes.forEach((cause) => {
    const pct = Math.min(100, Math.round((cause.raisedAmount / Math.max(1, cause.targetAmount)) * 100)) || 0;
    const card = document.createElement('article');
    card.className = 'card overflow-hidden rounded-2xl border border-gray-200 bg-white';
    card.id = `cause_${cause.id}`;
    card.innerHTML = `
      <div class="aspect-[16/10] bg-gray-100 overflow-hidden">
        <img src="${cause.image || 'https://via.placeholder.com/600x400.png?text=Cause'}" alt="${cause.title}" class="h-full w-full object-cover" loading="lazy"/>
      </div>
      <div class="p-5">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">${cause.title}</h3>
          <span class="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">${cause.category}</span>
        </div>
        <p class="mt-2 line-clamp-3 text-sm text-gray-600">${cause.description}</p>
        <div class="mt-4">
          <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="mt-2 flex items-center justify-between text-sm">
            <div class="text-gray-700"><strong>${formatCurrency(cause.raisedAmount)}</strong> raised</div>
            <div class="text-gray-500">goal ${formatCurrency(cause.targetAmount)} • ${pct}%</div>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="text-sm text-gray-600 hover:underline" data-share="${cause.id}">Share</button>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary" data-donate="${cause.id}">Donate</button>
          </div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  // Attach button handlers after rendering
  list.querySelectorAll('[data-donate]').forEach((btn) => {
    btn.addEventListener('click', () => openDonateModal(btn.getAttribute('data-donate')));
  });
  list.querySelectorAll('[data-share]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-share');
      const url = `${location.origin}${location.pathname}#cause_${id}`;
      try {
        await navigator.clipboard.writeText(url);
        toast('Link copied');
      } catch {
        prompt('Copy this link', url);
      }
    });
  });
}

// Toast (simple)
let toastTimeout;
function toast(msg) {
  clearTimeout(toastTimeout);
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-gray-900 text-white px-3 py-2 text-sm shadow-lg';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  toastTimeout = setTimeout(() => (el.style.opacity = '0'), 1800);
}

// Modals
function bindModalBasics(rootId) {
  const root = document.getElementById(rootId);
  root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeModal(rootId)));
  root.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(rootId);
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  el.removeAttribute('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  el.setAttribute('hidden', '');
}

function openDonateModal(causeId) {
  const idInput = document.getElementById('donateCauseId');
  idInput.value = causeId;
  document.getElementById('donateAmount').focus();
  openModal('modalDonate');
}

// Auth helpers
function getCurrentUser() { return getData(STORAGE_KEYS.currentUser); }
function setCurrentUser(user) { setData(STORAGE_KEYS.currentUser, user); }

// Handlers
function handleDonateSubmit(e) {
  e.preventDefault();
  const causeId = document.getElementById('donateCauseId').value;
  const amount = Math.max(1, parseFloat(document.getElementById('donateAmount').value || '0'));
  const donorName = (document.getElementById('donorName').value || '').trim();
  const anonymous = document.getElementById('donateAnon').checked;

  const causes = getData(STORAGE_KEYS.causes);
  const cause = causes.find((c) => c.id === causeId);
  if (!cause) {
    console.error('Cause not found for donation', causeId);
    toast('Cause not found');
    return;
  }

  const donations = getData(STORAGE_KEYS.donations);
  const donation = { id: uid('don'), causeId, amount, donorName, anonymous, timestamp: Date.now() };
  donations.push(donation);
  cause.raisedAmount = (cause.raisedAmount || 0) + amount;

  setData(STORAGE_KEYS.donations, donations);
  setData(STORAGE_KEYS.causes, causes);

  closeModal('modalDonate');
  toast('Thank you for your donation!');
  renderCauses();
  renderHeroStats();
}

function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const orgName = document.getElementById('signupOrg').value.trim();

  const ngos = getData(STORAGE_KEYS.ngos);
  const exists = ngos.some((n) => n.email === email);
  if (exists) {
    toast('Email already registered. Logging you in for demo.');
    const user = ngos.find((n) => n.email === email);
    setCurrentUser(user);
  } else {
    const ngo = { id: uid('ngo'), name, email, password, orgName };
    ngos.push(ngo);
    setData(STORAGE_KEYS.ngos, ngos);
    setCurrentUser(ngo);
  }
  closeModal('modalSignup');
  syncAuthUI();
  toast('Signed in (demo)');
}

function handleCreateCauseSubmit(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) { toast('Please sign up first'); return; }

  const title = document.getElementById('causeTitle').value.trim();
  const description = document.getElementById('causeDesc').value.trim();
  const category = document.getElementById('causeCategory').value;
  const targetAmount = Math.max(1, parseFloat(document.getElementById('causeTarget').value || '0'));
  const image = (document.getElementById('causeImage').value || '').trim();

  const causes = getData(STORAGE_KEYS.causes);
  const cause = { id: uid('cause'), ngoId: user.id, title, description, category, targetAmount, raisedAmount: 0, image: image || `https://via.placeholder.com/600x400.png?text=${encodeURIComponent(title)}` };
  causes.unshift(cause);
  setData(STORAGE_KEYS.causes, causes);

  closeModal('modalCreateCause');
  toast('Cause created');
  activeFilter = 'All';
  renderFilters();
  renderCauses();
}

function syncAuthUI() {
  const user = getCurrentUser();
  const createBtn = document.getElementById('btnCreateCause');
  if (user) {
    createBtn.classList.remove('hidden');
    document.getElementById('btnNgoSignup').textContent = 'Sign out';
  } else {
    createBtn.classList.add('hidden');
    document.getElementById('btnNgoSignup').textContent = 'NGO Signup';
  }
}

function attachGlobalHandlers() {
  document.getElementById('btnNgoSignup').addEventListener('click', () => {
    const user = getCurrentUser();
    if (user) { setCurrentUser(null); syncAuthUI(); toast('Signed out'); return; }
    openModal('modalSignup');
  });
  document.getElementById('btnFooterSignup').addEventListener('click', () => openModal('modalSignup'));
  document.getElementById('btnCreateCause').addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) { openModal('modalSignup'); return; }
    openModal('modalCreateCause');
  });
  document.getElementById('btnLearnMore').addEventListener('click', () => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }));
}

function hydrateYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

function mount() {
  useMemory = !storageAvailable();
  if (useMemory) {
    document.getElementById('storageBanner').classList.remove('hidden');
  }
  preloadSampleData();
  renderCategories();
  renderFilters();
  renderCauses();
  renderHeroStats();
  hydrateYear();
  bindModalBasics('modalDonate');
  bindModalBasics('modalSignup');
  bindModalBasics('modalCreateCause');
  document.getElementById('formDonate').addEventListener('submit', handleDonateSubmit);
  document.getElementById('formSignup').addEventListener('submit', handleSignupSubmit);
  document.getElementById('formCreateCause').addEventListener('submit', handleCreateCauseSubmit);
  attachGlobalHandlers();
  syncAuthUI();

  // Deep link to cause via hash
  if (location.hash.startsWith('#cause_')) {
    const id = location.hash.replace('#cause_', '');
    const el = document.getElementById(`cause_${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

window.addEventListener('error', (e) => {
  console.error('An error occurred:', e.message);
});

document.addEventListener('DOMContentLoaded', mount);
