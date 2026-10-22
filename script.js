'use strict';

// Two arrays organize the catalog and form fields; each product is an object.
const products = [
  { id: 'signature-loaf', name: 'Signature Loaf', category: 'bread', price: '$6–$12 per loaf', description: 'A rustic centerpiece for a shared meal.' },
  { id: 'sandwich-bread', name: 'Sandwich Bread', category: 'bread', price: '$6–$12 per loaf', description: 'A soft everyday loaf for toast and sandwiches.' },
  { id: 'breakfast-pastry', name: 'Breakfast Pastry', category: 'pastry', price: '$3–$6 each', description: 'A flaky treat for a morning coffee break.' },
  { id: 'muffin', name: 'Bakery Muffin', category: 'pastry', price: '$3–$6 each', description: 'An easy favorite to take along or share.' },
  { id: 'celebration-cake', name: 'Celebration Cake', category: 'cake', price: '$30–$85 per cake', description: 'Share your serving count, flavors, and decoration ideas.' }
];
const formFields = ['name', 'email', 'request-type', 'pickup', 'details', 'allergies'];
const storageKey = 'northStarBakery.preferences.v1';
const categories = ['all', 'bread', 'pastry', 'cake'];
let preferences = { favoriteIds: [], category: 'all' };
let storageAvailable = true;
let restoredPreferences = false;

function loadPreferences() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.favoriteIds)) return;
    preferences.favoriteIds = [...new Set(saved.favoriteIds)]
      .filter(id => products.some(product => product.id === id));
    preferences.category = categories.includes(saved.category) ? saved.category : 'all';
    restoredPreferences = true;
  } catch (error) {
    // Browsing and form validation still work if storage is blocked or damaged.
    storageAvailable = false;
  }
}

function savePreferences() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
  }
  updateStorageNote();
}

function updateStorageNote() {
  const message = storageAvailable
    ? 'Saved in this browser: favorites and your category choice. Contact information is not stored.'
    : 'Browser storage is unavailable. You can use this page, but new choices may not survive a reload.';
  ['storage-note', 'request-storage-note'].forEach(id => {
    const note = document.getElementById(id);
    if (note) note.textContent = message;
  });
}

function getFavorites() {
  return products.filter(product => preferences.favoriteIds.includes(product.id));
}

function toggleFavorite(id) {
  if (!products.some(product => product.id === id)) return;
  const index = preferences.favoriteIds.indexOf(id);
  if (index === -1) preferences.favoriteIds.push(id);
  else preferences.favoriteIds.splice(index, 1);
  savePreferences();
  updateFavoriteButtons();
  renderSavedList();
}

function updateFavoriteButtons() {
  document.querySelectorAll('[data-product-id]').forEach(button => {
    const saved = preferences.favoriteIds.includes(button.dataset.productId);
    const product = products.find(item => item.id === button.dataset.productId);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? 'Saved — remove favorite' : 'Save favorite';
    button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${product.name} ${saved ? 'from' : 'to'} favorites`);
  });
}

function renderSavedList() {
  const list = document.getElementById('saved-list');
  if (!list) return;
  const favorites = getFavorites();
  list.replaceChildren();
  favorites.forEach(product => {
    const item = document.createElement('li');
    item.textContent = product.name;
    list.append(item);
  });
  document.getElementById('favorites-status').textContent = favorites.length
    ? `${favorites.length} ${favorites.length === 1 ? 'favorite saved' : 'favorites saved'}. Your list is ready to use in a request.`
    : 'No favorites yet. Save a product above to start your list.';
  document.getElementById('clear-favorites').disabled = favorites.length === 0;
}

function renderProducts() {
  const list = document.getElementById('product-list');
  const shown = products.filter(product => preferences.category === 'all' || product.category === preferences.category);
  list.replaceChildren();
  shown.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-choice';
    const title = document.createElement('h3');
    title.textContent = product.name;
    const description = document.createElement('p');
    description.textContent = product.description;
    const price = document.createElement('p');
    price.textContent = `Sample price: ${product.price}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary-button';
    button.dataset.productId = product.id;
    button.addEventListener('click', () => toggleFavorite(product.id));
    card.append(title, description, price, button);
    list.append(card);
  });
  updateFavoriteButtons();
  document.getElementById('catalog-status').textContent = `Showing ${shown.length} ${shown.length === 1 ? 'product' : 'products'}.`;
}

function initFavorites() {
  const app = document.getElementById('favorites-app');
  if (!app) return;
  app.hidden = false;
  const filter = document.getElementById('category-filter');
  filter.value = preferences.category;
  filter.addEventListener('change', () => {
    preferences.category = filter.value;
    savePreferences();
    renderProducts();
  });
  document.getElementById('clear-favorites').addEventListener('click', () => {
    preferences.favoriteIds = [];
    savePreferences();
    updateFavoriteButtons();
    renderSavedList();
  });
  renderProducts();
  renderSavedList();
  if (restoredPreferences && getFavorites().length) {
    document.getElementById('favorites-status').textContent = `${getFavorites().length} saved ${getFavorites().length === 1 ? 'favorite restored' : 'favorites restored'} from this browser. Your category choice is restored too.`;
  }
}

function addFavoritesToDetails(announce = true) {
  const field = document.getElementById('details');
  const missing = getFavorites().filter(product => !field.value.includes(`Interested in ${product.name}.`));
  const added = missing.map(product => `Interested in ${product.name}. Please confirm quantity and availability.`).join('\n');
  if (added && (field.value.length + added.length + 1) > field.maxLength) {
    document.getElementById('prefill-status').textContent = 'Your details are too long to add more items. Shorten the text first.';
    return;
  }
  if (added) field.value = [field.value.trim(), added].filter(Boolean).join('\n');
  if (announce) {
    document.getElementById('prefill-status').textContent = missing.length
      ? 'Saved favorites added below. Edit quantities and preferences before reviewing.'
      : 'Your saved favorites are already included in the details.';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function initRequestFavorites() {
  const panel = document.getElementById('request-favorites');
  if (!panel) return;
  panel.hidden = false;
  const favorites = getFavorites();
  document.getElementById('request-saved-list').textContent = favorites.length
    ? `Saved in this browser: ${favorites.map(product => product.name).join(', ')}.`
    : 'You have no saved favorites. Browse Products to save a few, or write your request below.';
  document.getElementById('add-favorites').disabled = !favorites.length;
  document.getElementById('add-favorites').addEventListener('click', () => addFavoritesToDetails());
  // Populate an empty details field only; never replace text a visitor has typed.
  if (favorites.length && !document.getElementById('details').value) {
    addFavoritesToDetails(false);
    document.getElementById('prefill-status').textContent = 'Your saved favorites filled the item details below. Please add quantities and preferences.';
  }
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validateField(id) {
  const field = document.getElementById(id);
  const value = field.value.trim();
  if (id === 'name') {
    if (!value) return 'Enter your name.';
    if (value.length < 2 || value.length > 100) return 'Use between 2 and 100 characters for your name.';
  }
  if (id === 'email') {
    if (!value) return 'Enter your email address.';
    if (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter an email such as name@example.com.';
    if (value.length > 254) return 'Use an email address with no more than 254 characters.';
  }
  if (id === 'request-type' && !['preorder', 'question'].includes(value)) return 'Choose preorder request or general question.';
  if (id === 'pickup') {
    if (!value && document.getElementById('request-type').value === 'preorder') return 'Choose a pickup date for your preorder.';
    if (field.validity.badInput) return 'Enter a complete pickup date.';
    if (value) {
      if (value < todayString()) return 'Choose today or a future pickup date.';
      const date = new Date(`${value}T12:00:00`);
      if (Number.isNaN(date.getTime())) return 'Enter a valid pickup date.';
      if (date.getDay() === 1) return 'The bakery is closed on Mondays. Choose another day.';
    }
  }
  if (id === 'details') {
    if (!value) return 'Describe your items or question.';
    if (value.length < 10 || value.length > 1500) return 'Use between 10 and 1500 characters for your details.';
  }
  if (id === 'allergies' && value.length > 500) return 'Keep allergy notes to 500 characters or fewer.';
  return '';
}

function showFieldError(id) {
  const field = document.getElementById(id);
  const message = validateField(id);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  const error = document.getElementById(`${id}-error`);
  error.textContent = message ? `Error: ${message}` : '';
  error.hidden = !message;
  return !message;
}

function initValidation() {
  const form = document.querySelector('form');
  if (!form) return;
  form.noValidate = true; // Keep HTML validation as a fallback when JavaScript is off.
  formFields.forEach(id => {
    const field = document.getElementById(id);
    const error = document.createElement('span');
    error.id = `${id}-error`;
    error.className = 'field-error';
    error.hidden = true;
    field.insertAdjacentElement('afterend', error);
    field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
    field.addEventListener('blur', () => showFieldError(id));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') showFieldError(id);
      document.getElementById('request-review').hidden = true;
      document.getElementById('form-errors').hidden = true;
    });
  });
  const requestType = document.getElementById('request-type');
  requestType.addEventListener('change', () => {
    document.getElementById('pickup').required = requestType.value === 'preorder';
    if (document.getElementById('pickup').getAttribute('aria-invalid') === 'true') showFieldError('pickup');
    showFieldError('request-type');
  });
  document.getElementById('pickup').min = todayString();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = formFields.filter(id => !showFieldError(id));
    const summary = document.getElementById('form-errors');
    if (invalid.length) {
      summary.hidden = false;
      summary.textContent = `Please correct ${invalid.length} ${invalid.length === 1 ? 'field' : 'fields'} below. Your entries have been kept.`;
      document.getElementById('request-review').hidden = true;
      document.getElementById(invalid[0]).focus();
      return;
    }
    summary.hidden = true;
    const values = Object.fromEntries(formFields.map(id => [id, document.getElementById(id).value.trim()]));
    document.getElementById('review-text').textContent = `Name: ${values.name}\nEmail: ${values.email}\nRequest: ${values['request-type'] === 'preorder' ? 'Preorder' : 'General question'}\nPickup: ${values.pickup || 'Not requested'}\nDetails: ${values.details}\nAllergy notes: ${values.allergies || 'None provided'}`;
    document.getElementById('request-review').hidden = false;
  });
}

loadPreferences();
initFavorites();
initRequestFavorites();
initValidation();
updateStorageNote();
