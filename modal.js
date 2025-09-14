// Modal class = used to display extra details about podcasts or genres
export class Modal {
  // CSS selectors for the modal elements
  static SELECTORS = {
    modalCover: '#modalCover',      // place to show podcast cover image
    modalTitle: '#modalTitle',      // modal title
    modalDesc: '#modalDescription', // description text
    modalGenres: '#modalGenres',    // genre tags
    modalUpdated: '#modalUpdated',  // last updated date
    modalSeasons: '#modalSeasons',  // seasons or shows list
    closeBtn: '.close-btn',         // close button
    sectionTitle: '#modalSectionTitle', // text above seasons/shows
  };

  /**
   * Creates a Modal for podcasts or genres
   * @param {string} modalId - The modal element ID in HTML
   * @param {Object} [options] - Extra setup (genres + podcasts)
   */
  constructor(modalId, { genreMap = {}, podcasts = [] } = {}) {
    this.genreMap = genreMap;   // maps genre IDs → names
    this.podcasts = podcasts;   // all podcast data

    // connect JS → HTML elements
    this.modal = document.getElementById(modalId);
    this.modalCover = this.modal.querySelector(Modal.SELECTORS.modalCover);
    this.modalTitle = this.modal.querySelector(Modal.SELECTORS.modalTitle);
    this.modalDesc = this.modal.querySelector(Modal.SELECTORS.modalDesc);
    this.modalGenres = this.modal.querySelector(Modal.SELECTORS.modalGenres);
    this.modalUpdated = this.modal.querySelector(Modal.SELECTORS.modalUpdated);
    this.modalSeasons = this.modal.querySelector(Modal.SELECTORS.modalSeasons);
    this.sectionTitle = this.modal.querySelector(Modal.SELECTORS.sectionTitle);
    this.closeBtn = this.modal.querySelector(Modal.SELECTORS.closeBtn);

    // set up event listeners
    this._bindEvents();
  }

  // Add close functionality (button, click outside, Esc key)
  _bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    window.addEventListener('click', e => {
      if (e.target === this.modal) this.close(); // click outside modal
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close(); // press Esc
    });
  }

  /**
   * Open modal → show details for genre OR podcast
   * @param {Object} data - Genre or podcast object
   * @param {boolean} [isGenre=false] - true = genre, false = podcast
   */
  open(data, isGenre = false) {
    this.modalSeasons.innerHTML = ''; // clear seasons/shows
    this._setSectionTitle(isGenre ? 'Shows' : 'Seasons'); // title label

    // decide what to display
    if (isGenre) {
      this._openGenre(data);
    } else {
      this._openPodcast(data);
    }
  }

  // Close modal (hide it with CSS class)
  close() {
    this.modal.classList.add('hidden');
  }

  // ========== GENRE DISPLAY ==========
  _openGenre(genre) {
    this._setCover('', ''); // genres don’t have cover images
    this._setTitle(genre.title);
    this._setDescription(genre.description);
    this._setGenres([genre.id]); // show genre name
    this._setUpdated(''); // genres don’t use updated date
    this._setShowsForGenre(genre); // list shows inside genre
    this.modal.classList.remove('hidden'); // show modal
  }

  // ========== PODCAST DISPLAY ==========
  _openPodcast(podcast) {
    this._setCover(podcast.image, podcast.title); // cover image
    this._setTitle(podcast.title);
    this._setDescription(podcast.description);
    this._setUpdated(podcast.updated);
    this._setGenres(podcast.genres);
    this._setSeasons(podcast.seasons);
    this.modal.classList.remove('hidden'); // show modal
  }

  // --- Helper functions to fill in modal content ---

  // show cover image (if available)
  _setCover(imageUrl, title) {
    this.modalCover.innerHTML = '';
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = ${title} Cover;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      this.modalCover.appendChild(img);
    }
  }

  _setTitle(title) {
    this.modalTitle.textContent = title || '';
  }

  _setDescription(description) {
    this.modalDesc.textContent = description || '';
  }

  // show last updated date in readable format
  _setUpdated(updated) {
    if (!updated) {
      this.modalUpdated.textContent = '';
      return;
    }
    this.modalUpdated.textContent = `📅 Last updated: ${new Date(updated).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
  }

  // create genre tags
  _setGenres(genreIds) {
    this.modalGenres.innerHTML = '';
    genreIds.forEach(id => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = this.genreMap[String(id)] || this.genreMap[Number(id)] || Genre ${id};
      this.modalGenres.appendChild(tag);
    });
  }

  // show number of seasons (for podcasts)
  _setSeasons(seasons) {
    this.modalSeasons.innerHTML = '';
    if (seasons) {
      this.modalSeasons.textContent = Seasons: ${seasons};
    }
  }

  // list all shows that belong to a genre
  _setShowsForGenre(genre) {
    this.modalSeasons.innerHTML = '';

    const showsContainer = document.createElement('div');
    showsContainer.className = 'shows-list';

    // find podcasts that belong to this genre
    const shows = this.podcasts.filter(p =>
      genre.shows?.includes(p.id) || genre.shows?.includes(String(p.id))
    );

    // if no shows → show fallback text
    if (shows.length === 0) {
      showsContainer.textContent = 'No shows available for this genre.';
    } else {
      // create clickable show items
      shows.forEach(show => {
        const showDiv = document.createElement('div');
        showDiv.className = 'show-item';
        showDiv.textContent = show.title;
        // clicking a show opens its podcast modal
        showDiv.addEventListener('click', () => this.open(show, false));
        showsContainer.appendChild(showDiv);
      });
    }

    this.modalSeasons.appendChild(showsContainer);
  }

  // set label for "Seasons" or "Shows"
  _setSectionTitle(title) {
    if (this.sectionTitle) {
      this.sectionTitle.textContent = title;
    }
  }
}