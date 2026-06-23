# Walkthrough: Michigan Football Flashcards

We have successfully built and verified the **"Michigan Football Flashcards"** responsive web application! It has been populated with a scraped database of all **109 players** from the official University of Michigan Football roster.

---

## Features Implemented

1. **Roster Integration (`roster.json`)**:
   - Automated parser extracted player details (full name, jersey number, position, official headshot image url) from the Nuxt-based MGoBlue.com roster.
   
2. **Interactive 3D Flashcards**:
   - Built a custom grid layout using CSS variables.
   - Designed 3D card-flip animations using `perspective: 1200px` on containers, `transform-style: preserve-3d` on cards, and `backface-visibility: hidden` on both faces.
   - Clicking/tapping cards rotates them 180 degrees.
   - **Front face**: Displays the official player roster headshot filling the card aspect ratio (3:4) with a modern bottom shadow overlay.
   - **Back face**: Stylized with a deep Navy blue collegiate pattern, a large Maize jersey number, player name, and detailed position title.

3. **Instant Search & Group Filtering**:
   - Users can search for players dynamically by name or jersey number.
   - Position groups are filtered via quick-filter chips:
     - **QB**: Quarterbacks
     - **RB**: Running Backs
     - **WR**: Wide Receivers
     - **TE**: Tight Ends
     - **OL**: Offensive Linemen (OT, OG, OC, C, G, T)
     - **DL**: Defensive Linemen (DE, DT, DL, NT)
     - **LB**: Linebackers (LB, ILB, OLB)
     - **DB**: Defensive Backs (CB, S, DB, SS, FS)
     - **Special Teams**: Kickers, Punters, Long Snappers (K, P, LS, H, PK)

4. **Study Mode & Deck Controls**:
   - **Shuffle Cards**: Randomizes the card grid ordering on-demand.
   - **Study Mode Panel**: Displays a full-screen blurred glassmorphic overlay containing a single card focus deck.
   - **Settings**: Option to "Exclude Known Players" from the deck dynamically.
   - **Control Buttons**: Quick navigation to Previous/Next card, "Mark as Known" (toggles button styling and moves to next card automatically).
   - **Desktop Keyboard Shortcuts**:
     - `ArrowLeft` / `ArrowRight` to navigate players.
     - `Spacebar` to flip the card.
     - `Enter` / `k` to toggle the "Known" status.
     - `Escape` to exit Study Mode.

5. **Progress Tracking**:
   - Syncs "Known" status to `localStorage` key `michigan_football_known_players`.
   - Displays a dynamic **Mastery Progress Bar** in the header displaying percentage mastered and ratio of players known (e.g., `12 / 109 known`).

6. **Maize & Blue Theme & Dark Mode Toggle**:
   - Styled using custom CSS variables supporting Light and Dark modes.
   - Dark mode toggles color schemes dynamically while preserving the athletic Michigan Navy and Maize contrast ratio.
   - Fixed a text-visibility bug where the player name and back details became dark on dark background when switching to dark mode.
   - Persistent theme selection stored in `localStorage`.

7. **Vector Fallback Placeholder**:
   - Built `placeholder.svg` depicting the iconic block "M" inside a golden circle, styled in Maize and Blue with sports-tech grid lines.
   - Triggered automatically on `onerror` image event or if image URL is null.

---

## File Structure

The project has been created inside:
[michigan-football-flashcards](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/)

- [index.html](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/index.html) - Structural framework and Study Mode containers.
- [styles.css](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/styles.css) - Modern layout rules, 3D card flips, media queries, and themes.
- [app.js](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/app.js) - App controller, progress states, event delegation, and shortcuts.
- [roster.json](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/roster.json) - Cleansed player dataset.
- [placeholder.svg](file:///Users/luciagrasso/.gemini/antigravity/scratch/michigan-football-flashcards/placeholder.svg) - Vector fallback image.

---

## How to Run & Verify

1. **Development Server**:
   A local development server is already running in the background at:
   [http://localhost:8000/](http://localhost:8000/)

2. **Verify Interactive Features**:
   - Open [http://localhost:8000/](http://localhost:8000/) in your browser.
   - **Flip Cards**: Click any card in the grid; it will flip to reveal player position, name, and jersey.
   - **Progress Badge**: Click "Mark Known" on the back of any card. Observe that the progress bar increases and a green checkmark badge appears on the front of the card.
   - **Search & Filters**: Type "Edwards" in search or select "QB". Verify the grid displays only matching cards.
   - **Study Mode**:
     - Click **Study Mode** in the controls panel.
     - Toggle the card using `Spacebar` or click.
     - Press `ArrowRight` to view the next random card.
     - Mark players as known.
     - Toggle "Exclude Known" and see them vanish from your stack.
     - Press `Escape` or click `&times;` to exit and see your mastery progress updated on the main grid.
   - **Dark Mode**: Click the sun/moon button in the top right corner. The site will transition into a deep dark blue/slate theme.
