import { podcasts, genres } from './data.js';
import { Modal } from './modal.js';

const grid = document.getElementById('podcastGrid');
const genreSelect = document.getElementById('genre');

// Build a map of genreId → genreName
const genreMap = genres.reduce((map, g) => {
  map[g.id] = g.title;
  return map;
}, {});

// Modal instance
const podcastModal = new Modal('podcastModal', { genreMap, podcasts });

// Format date for "Updated today / yesterday / X days ago"
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Updated today';
  if (diff === 1) return 'Updated yesterday';
  if (diff <= 30) return 'Updated ${diff} days ago';

  return `Updated on ${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`;
}

// Build tags for genres
function createTags(genreIds = []) {
  return genreIds.map(id => {
    const name = genreMap[id] || 'Genre ${id}';
    return <span class="tag">${name}</span>;
  }).join('');
}

// Open modal (podcast or genre)
function openModal(item, type = 'podcast') {
  podcastModal.open(item, type === 'genre');
}

// Create card for podcast or genre
function createCard(item, type = 'podcast') {
  if (type === 'podcast') {
    return `
      <div class="card" data-type="podcast" data-id="${item.id}">
        <div class="cover">
          <img src="${item.image}" alt="${item.title} Cover">
        </div>
        <h3>${item.title}</h3>
        <p class="meta">📅 ${item.seasons} seasons</p>
        <div class="tags">${createTags(item.genres)}</div>
        <p class="updated">${formatDate(item.updated)}</p>
      </div>
    `;
  } else {
    return `
      <div class="card genre-card" data-type="genre" data-id="${item.id}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `;
  }
}

// Render items inside the grid
function renderItems(items, type = 'podcast') {
  if (items.length === 0) {
    grid.innerHTML = <p>No items found.</p>;
    return;
  }
  grid.innerHTML = items.map(item => createCard(item, type)).join('');

  // Add event listeners AFTER rendering
  grid.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    const type = card.dataset.type;
    const item = (type === 'podcast')
      ? podcasts.find(p => p.id == id)
      : genres.find(g => g.id == id);

    card.addEventListener('click', () => openModal(item, type));
  });
}

// Filter podcasts by genre
function filterByGenre(items, genreId) {
  if (genreId === 'all') return items;
  const id = Number(genreId);
  if (isNaN(id)) return items;
  return items.filter(item => item.genres.includes(id));
}

// Populate the dropdown with genres
function populateGenreFilter() {
  genreSelect.innerHTML = `
    <option value="all">All Genres</option>
    ${genres.map(g => <option value="${g.id}">${g.title}</option>).join('')}
  `;
}

// Event: change dropdown → filter
genreSelect.addEventListener('change', e => {
  const filtered = filterByGenre(podcasts, e.target.value);
  renderItems(filtered, 'podcast');
});

// Initialize UI
populateGenreFilter();
renderItems(podcasts, 'podcast');