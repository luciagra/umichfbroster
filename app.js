/* ==========================================================================
   MICHIGAN FOOTBALL FLASHCARDS - APPLICATION SCRIPT
   ========================================================================== */

// App State
let players = [];              // Raw roster from JSON
let visiblePlayers = [];       // Filtered and searched players
let knownPlayerIds = new Set(); // Set of player IDs marked as "Known"
let currentFilter = "ALL";     // Active position group
let searchQuery = "";          // Active text search query
let activeStudyPool = [];      // Current deck being studied
let studyIndex = 0;            // Current card index in Study Mode

// DOM Elements
const flashcardsGrid = document.getElementById("flashcards-grid");
const masteryPercent = document.getElementById("mastery-percent");
const masteryCount = document.getElementById("mastery-count");
const masteryBar = document.getElementById("mastery-bar");
const searchBar = document.getElementById("search-bar");
const clearSearchBtn = document.getElementById("clear-search-btn");
const filtersContainer = document.getElementById("filters-container");
const shuffleBtn = document.getElementById("shuffle-btn");
const studyModeBtn = document.getElementById("study-mode-btn");
const resetBtn = document.getElementById("reset-btn");
const resultsCount = document.getElementById("results-count");
const themeToggle = document.getElementById("theme-toggle");

// Study Mode DOM Elements
const studyView = document.getElementById("study-view");
const exitStudyBtn = document.getElementById("exit-study-btn");
const studyDeckProgress = document.getElementById("study-deck-progress");
const studyCardWrapper = document.getElementById("study-card-wrapper");
const studyPrevBtn = document.getElementById("study-prev-btn");
const studyNextBtn = document.getElementById("study-next-btn");
const studyKnownBtn = document.getElementById("study-known-btn");
const studyUnknownBtn = document.getElementById("study-unknown-btn");
const excludeKnownCheckbox = document.getElementById("exclude-known-checkbox");

/* ==========================================================================
   INITIALIZATION & DATA LOADING
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadKnownPlayers();
  fetchRoster();
  setupEventListeners();
});

// Load the roster JSON
async function fetchRoster() {
  try {
    const response = await fetch("roster.json");
    if (!response.ok) {
      throw new Error(`Failed to load roster: ${response.status}`);
    }
    players = await response.json();
    visiblePlayers = [...players];
    
    // Sort players initially by jersey number (numerically)
    sortPlayersByJersey(players);
    visiblePlayers = [...players];

    updateProgress();
    filterAndSearch();
  } catch (error) {
    console.error("Error loading roster:", error);
    flashcardsGrid.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--danger-color);">
        <p style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">Failed to load player roster</p>
        <p style="font-size: 14px; color: var(--text-muted);">Please make sure the roster.json file is generated and running on a local server.</p>
      </div>
    `;
  }
}

// Helper: Sort players by jersey number (numerically)
function sortPlayersByJersey(playerList) {
  playerList.sort((a, b) => {
    const numA = parseInt(a.jersey, 10) || 999;
    const numB = parseInt(b.jersey, 10) || 999;
    return numA - numB;
  });
}

// Load known players from localStorage
function loadKnownPlayers() {
  const stored = localStorage.getItem("michigan_football_known_players");
  if (stored) {
    try {
      const ids = JSON.parse(stored);
      knownPlayerIds = new Set(ids);
    } catch (e) {
      console.error("Failed to parse known players from storage:", e);
      knownPlayerIds = new Set();
    }
  }
}

// Save known players to localStorage
function saveKnownPlayers() {
  localStorage.setItem("michigan_football_known_players", JSON.stringify([...knownPlayerIds]));
  updateProgress();
}

// Update the mastery stats in the header
function updateProgress() {
  const total = players.length;
  const known = knownPlayerIds.size;
  const percent = total > 0 ? Math.round((known / total) * 100) : 0;
  
  masteryPercent.textContent = `${percent}%`;
  masteryCount.textContent = `${known} / ${total} known`;
  masteryBar.style.width = `${percent}%`;
}

/* ==========================================================================
   POSITION GROUP MAPPING
   ========================================================================== */

// Checks if a player's official position maps to a chosen UI filter group
function matchesPositionGroup(playerPos, group) {
  if (group === "ALL") return true;
  
  const pos = (playerPos || "").toUpperCase();
  switch (group) {
    case "QB":
      return pos === "QB";
    case "RB":
      return pos === "RB";
    case "WR":
      return pos === "WR";
    case "TE":
      return pos === "TE";
    case "OL":
      return pos === "OL" || pos === "OT" || pos === "OG" || pos === "OC" || pos === "C" || pos === "G" || pos === "T";
    case "DL":
      return pos === "DL" || pos === "DE" || pos === "DT" || pos === "NT";
    case "LB":
      return pos === "LB" || pos === "ILB" || pos === "OLB";
    case "DB":
      return pos === "DB" || pos === "CB" || pos === "S" || pos === "SAF" || pos === "FS" || pos === "SS";
    case "Special Teams":
      return pos === "K" || pos === "P" || pos === "LS" || pos === "H" || pos === "PK" || pos === "SPEC";
    default:
      return false;
  }
}

/* ==========================================================================
   FILTERING, SEARCHING & SHUFFLING
   ========================================================================== */

function filterAndSearch() {
  const query = searchBar.value.trim().toLowerCase();
  
  visiblePlayers = players.filter(player => {
    // Position match
    const posMatch = matchesPositionGroup(player.position, currentFilter);
    // Search match (name or jersey number)
    const nameMatch = player.fullName.toLowerCase().includes(query) || player.jersey.toString() === query;
    return posMatch && nameMatch;
  });

  resultsCount.textContent = `Showing ${visiblePlayers.length} player${visiblePlayers.length === 1 ? '' : 's'}`;
  renderGrid();
}

// Shuffles the array of currently visible players
function shuffleVisibleCards() {
  // Fisher-Yates Shuffle
  for (let i = visiblePlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [visiblePlayers[i], visiblePlayers[j]] = [visiblePlayers[j], visiblePlayers[i]];
  }
  renderGrid();
}

/* ==========================================================================
   GRID RENDERING
   ========================================================================== */

function renderGrid() {
  if (visiblePlayers.length === 0) {
    flashcardsGrid.innerHTML = `
      <div class="no-results-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 16px; font-weight: 600;">No players found matching your criteria.</p>
        <p style="font-size: 13px; margin-top: 5px;">Try adjusting your filters or search terms!</p>
      </div>
    `;
    return;
  }

  flashcardsGrid.innerHTML = visiblePlayers.map(player => {
    const isKnown = knownPlayerIds.has(player.id);
    const imgUrl = player.imageUrl || "placeholder.svg";
    
    return `
      <div class="flashcard-container ${isKnown ? 'is-known' : ''}" data-id="${player.id}">
        <div class="flashcard" id="card-${player.id}" role="button" aria-expanded="false" tabindex="0">
          
          <!-- Card Front: Headshot Photo Only -->
          <div class="card-front">
            <div class="known-badge-corner" title="Player Marked as Known">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="card-img-wrapper">
              <img 
                src="${imgUrl}" 
                alt="${player.fullName}" 
                class="player-img" 
                loading="lazy" 
                onload="this.classList.add('loaded')" 
                onerror="this.src='placeholder.svg'; this.classList.add('loaded')"
              >
              <div class="card-img-overlay"></div>
            </div>
          </div>
          
          <!-- Card Back: Details & Controls -->
          <div class="card-back">
            <div class="card-back-header">
              <span class="position-badge">${player.position}</span>
              <span style="font-weight: 700; opacity: 0.6; font-size: 13px;">#${player.jersey}</span>
            </div>
            
            <div class="jersey-number-large">${player.jersey}</div>
            
            <div class="card-back-details">
              <h3 class="player-name-large">${player.fullName}</h3>
              <p class="player-pos-name">${getPositionFullName(player.position)}</p>
            </div>
            
            <div class="card-back-actions">
              <button class="card-known-toggle" data-player-id="${player.id}" aria-label="Toggle player known status">
                <span class="btn-text-content">${isKnown ? 'Known ✓' : 'Mark Known'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join("");

  // Attach card flip listeners
  const cards = flashcardsGrid.querySelectorAll(".flashcard");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const isExpanded = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", !isExpanded);
      card.classList.toggle("flipped");
    });
    
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Attach "Known" toggle button click listeners (stop propagation so it doesn't flip card)
  const toggles = flashcardsGrid.querySelectorAll(".card-known-toggle");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop click from triggering flip
      const playerId = parseInt(toggle.getAttribute("data-player-id"), 10);
      togglePlayerKnown(playerId);
    });
  });
}

// Toggle a player's known status
function togglePlayerKnown(playerId) {
  const container = document.querySelector(`.flashcard-container[data-id="${playerId}"]`);
  const button = container ? container.querySelector(`.card-known-toggle`) : null;
  
  if (knownPlayerIds.has(playerId)) {
    knownPlayerIds.delete(playerId);
    if (container) container.classList.remove("is-known");
    if (button) button.querySelector(".btn-text-content").textContent = "Mark Known";
  } else {
    knownPlayerIds.add(playerId);
    if (container) container.classList.add("is-known");
    if (button) button.querySelector(".btn-text-content").textContent = "Known ✓";
  }
  
  saveKnownPlayers();
}

// Get the full position name for display
function getPositionFullName(pos) {
  const map = {
    "QB": "Quarterback",
    "RB": "Running Back",
    "WR": "Wide Receiver",
    "TE": "Tight End",
    "OL": "Offensive Lineman",
    "OT": "Offensive Tackle",
    "OG": "Offensive Guard",
    "OC": "Offensive Center",
    "C": "Center",
    "G": "Guard",
    "T": "Tackle",
    "DL": "Defensive Lineman",
    "DE": "Defensive End",
    "DT": "Defensive Tackle",
    "NT": "Nose Tackle",
    "LB": "Linebacker",
    "CB": "Cornerback",
    "S": "Safety",
    "FS": "Free Safety",
    "SS": "Strong Safety",
    "K": "Kicker",
    "P": "Punter",
    "LS": "Long Snapper"
  };
  return map[pos] || pos;
}

/* ==========================================================================
   STUDY MODE SYSTEM
   ========================================================================== */

function enterStudyMode() {
  // Build the deck of study players
  buildStudyDeck();

  if (activeStudyPool.length === 0) {
    const filterDesc = currentFilter === "ALL" ? "" : ` in group ${currentFilter}`;
    alert(`No players found to study${filterDesc}. Check your filter settings or uncheck "Exclude Known".`);
    return;
  }

  studyIndex = 0;
  studyView.style.display = "flex";
  document.body.style.overflow = "hidden"; // Stop background scroll
  
  renderStudyCard();
}

function exitStudyMode() {
  studyView.style.display = "none";
  document.body.style.overflow = ""; // Re-enable background scroll
  
  // Re-sync progress tracking on the grid in case changes were made in Study Mode
  filterAndSearch();
}

// Prepares the study deck based on filters, search query, and exclude setting
function buildStudyDeck() {
  const query = searchBar.value.trim().toLowerCase();
  const excludeKnown = excludeKnownCheckbox.checked;

  activeStudyPool = players.filter(player => {
    const posMatch = matchesPositionGroup(player.position, currentFilter);
    const nameMatch = player.fullName.toLowerCase().includes(query) || player.jersey.toString() === query;
    const knownFilter = excludeKnown ? !knownPlayerIds.has(player.id) : true;
    return posMatch && nameMatch && knownFilter;
  });

  // Shuffle the study deck initially for random learning
  for (let i = activeStudyPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [activeStudyPool[i], activeStudyPool[j]] = [activeStudyPool[j], activeStudyPool[i]];
  }
}

function renderStudyCard() {
  if (activeStudyPool.length === 0) {
    studyCardWrapper.innerHTML = `
      <div class="empty-study-state" style="text-align: center; padding: 40px; background-color: var(--card-bg-front); border-radius: var(--radius-md); border: 2px dashed rgba(255,255,255,0.1); width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--umich-maize)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:15px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <p style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 5px;">Mastery Complete!</p>
        <p style="font-size: 13px; color: var(--text-muted); max-width: 200px;">You've marked all matching players in this set as Known!</p>
      </div>
    `;
    studyDeckProgress.textContent = "0 / 0 Cards";
    studyKnownBtn.disabled = true;
    studyUnknownBtn.disabled = true;
    return;
  }

  // Double check index bounds
  if (studyIndex >= activeStudyPool.length) studyIndex = 0;
  if (studyIndex < 0) studyIndex = activeStudyPool.length - 1;

  studyKnownBtn.disabled = false;
  studyUnknownBtn.disabled = false;

  const player = activeStudyPool[studyIndex];
  const isKnown = knownPlayerIds.has(player.id);
  const imgUrl = player.imageUrl || "placeholder.svg";

  studyDeckProgress.textContent = `${studyIndex + 1} / ${activeStudyPool.length} Cards`;

  studyCardWrapper.innerHTML = `
    <div class="flashcard-container ${isKnown ? 'is-known' : ''}" style="height: 100%;" data-id="${player.id}">
      <div class="flashcard" id="study-active-card" role="button" aria-expanded="false" tabindex="0">
        
        <!-- Card Front -->
        <div class="card-front">
          <div class="known-badge-corner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="card-img-wrapper">
            <img 
              src="${imgUrl}" 
              alt="${player.fullName}" 
              class="player-img" 
              onload="this.classList.add('loaded')" 
              onerror="this.src='placeholder.svg'; this.classList.add('loaded')"
            >
            <div class="card-img-overlay"></div>
          </div>
        </div>
        
        <!-- Card Back -->
        <div class="card-back">
          <div class="card-back-header">
            <span class="position-badge">${player.position}</span>
            <span style="font-weight: 700; opacity: 0.6; font-size: 13px;">#${player.jersey}</span>
          </div>
          
          <div class="jersey-number-large">${player.jersey}</div>
          
          <div class="card-back-details">
            <h3 class="player-name-large">${player.fullName}</h3>
            <p class="player-pos-name">${getPositionFullName(player.position)}</p>
          </div>
          
          <div style="height: 38px;"></div> <!-- visual spacing balance -->
        </div>

      </div>
    </div>
  `;

  // Apply visual button states based on currently studied card
  updateStudyButtonsState(isKnown);

  // Bind flip action inside wrapper
  const card = document.getElementById("study-active-card");
  if (card) {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  }
}

function updateStudyButtonsState(isKnown) {
  if (isKnown) {
    studyKnownBtn.style.display = "none";
    studyUnknownBtn.style.display = "inline-flex";
  } else {
    studyKnownBtn.style.display = "inline-flex";
    studyUnknownBtn.style.display = "none";
  }
}

// Mark current studied player as known and auto-advance
function studyMarkKnown() {
  if (activeStudyPool.length === 0) return;
  const player = activeStudyPool[studyIndex];
  
  if (!knownPlayerIds.has(player.id)) {
    knownPlayerIds.add(player.id);
    saveKnownPlayers();
  }

  // Visual card animation feedback
  const card = document.getElementById("study-active-card");
  const container = studyCardWrapper.querySelector(".flashcard-container");
  if (container) container.classList.add("is-known");
  
  // Show known corner badge on front side immediately
  updateStudyButtonsState(true);

  // If excluding known players, we remove it from study pool
  if (excludeKnownCheckbox.checked) {
    setTimeout(() => {
      activeStudyPool.splice(studyIndex, 1);
      
      if (activeStudyPool.length === 0) {
        renderStudyCard();
      } else {
        // If index is past the deck bounds, loop it back
        if (studyIndex >= activeStudyPool.length) {
          studyIndex = 0;
        }
        renderStudyCard();
      }
    }, 400); // Wait for feedback animation
  } else {
    // Just move to the next card
    setTimeout(() => {
      navigateStudyDeck(1);
    }, 450);
  }
}

// Mark current studied player as unknown
function studyMarkUnknown() {
  if (activeStudyPool.length === 0) return;
  const player = activeStudyPool[studyIndex];

  if (knownPlayerIds.has(player.id)) {
    knownPlayerIds.delete(player.id);
    saveKnownPlayers();
  }

  const container = studyCardWrapper.querySelector(".flashcard-container");
  if (container) container.classList.remove("is-known");
  
  updateStudyButtonsState(false);

  // Just refresh current card view to sync
  renderStudyCard();
}

function navigateStudyDeck(direction) {
  if (activeStudyPool.length <= 1) return;
  
  studyIndex += direction;
  if (studyIndex >= activeStudyPool.length) {
    studyIndex = 0; // Wrap to beginning
  } else if (studyIndex < 0) {
    studyIndex = activeStudyPool.length - 1; // Wrap to end
  }
  
  renderStudyCard();
}

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */

function setupEventListeners() {
  // Search bar inputs
  searchBar.addEventListener("input", () => {
    const val = searchBar.value.trim();
    clearSearchBtn.style.display = val.length > 0 ? "block" : "none";
    filterAndSearch();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchBar.value = "";
    clearSearchBtn.style.display = "none";
    searchBar.focus();
    filterAndSearch();
  });

  // Filters navigation click delegation
  filtersContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;

    // Toggle active state
    filtersContainer.querySelectorAll(".filter-chip").forEach(el => el.classList.remove("active"));
    chip.classList.add("active");

    currentFilter = chip.getAttribute("data-position");
    filterAndSearch();
  });

  // Action Buttons
  shuffleBtn.addEventListener("click", shuffleVisibleCards);
  studyModeBtn.addEventListener("click", enterStudyMode);
  
  resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to clear your study progress? This will reset all marked 'Known' players.");
    if (confirmReset) {
      knownPlayerIds.clear();
      saveKnownPlayers();
      filterAndSearch();
    }
  });

  // Theme Toggle Button
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // Study Mode Controls
  exitStudyBtn.addEventListener("click", exitStudyMode);
  studyPrevBtn.addEventListener("click", () => navigateStudyDeck(-1));
  studyNextBtn.addEventListener("click", () => navigateStudyDeck(1));
  studyKnownBtn.addEventListener("click", studyMarkKnown);
  studyUnknownBtn.addEventListener("click", studyMarkUnknown);
  
  excludeKnownCheckbox.addEventListener("change", () => {
    // Re-build study deck since settings changed
    const currentActiveCard = activeStudyPool[studyIndex];
    buildStudyDeck();
    
    // Attempt to keep studying same card if it remains in the deck
    if (currentActiveCard) {
      const newIndex = activeStudyPool.findIndex(p => p.id === currentActiveCard.id);
      studyIndex = newIndex !== -1 ? newIndex : 0;
    } else {
      studyIndex = 0;
    }
    
    renderStudyCard();
  });

  // Global Keyboard Navigation for Study Mode
  document.addEventListener("keydown", (e) => {
    if (studyView.style.display === "flex") {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          navigateStudyDeck(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateStudyDeck(1);
          break;
        case " ": // Spacebar to flip
          e.preventDefault();
          const card = document.getElementById("study-active-card");
          if (card) card.click();
          break;
        case "k": // 'K' key to mark known
        case "Enter":
          if (activeStudyPool.length > 0) {
            const player = activeStudyPool[studyIndex];
            if (knownPlayerIds.has(player.id)) {
              studyMarkUnknown();
            } else {
              studyMarkKnown();
            }
          }
          break;
        case "Escape": // Close study mode
          exitStudyMode();
          break;
      }
    }
  });
}

/* ==========================================================================
   DARK/LIGHT THEME INITIALIZATION
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}
