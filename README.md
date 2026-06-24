@ -1,82 +1,20 @@
# CEBRIC F1 PADDOCK PLATFORM
## Run Locally

### 1. ⚙️ Advanced 1v1 Duel Sandbox Simulation
*   **Deep Driver Profiles**: Incorporates dynamic intelligence profiles including React Speed, Racecraft, Absolute Pace, and Paddock Awareness.
*   **Deterministic Simulation Engine**: Configures specific combinations of **slick/wet compounds**, **aerodynamic offsets (High Downforce vs. Low Drag)**, and **combat strategy trims (Attack, Defend, Balanced)**.
*   **Reactive Environmental Telemetry**: Wet weather circuits trigger severe slick tyre slide simulations, with detailed live commentary.
**Prerequisites:**  Node.js

### 2. 🏁 Real-Time Formula 1 Live Feeds & Telemetry
*   **Championship Standings**: Visually traces current driver and constructor championship standings using real-time progress ratios.
*   **Granular Circuits Database**: Fully maps precise metadata for all official Grand Prix circuits, including length, lap count, lap records, and visual paths.
*   **Contextual FIA Stewarding Bulletins**: Connects with live document indices to fetch official technical delegate reports and stewards' decisions. If the live feed undergoes rate-limiting, the system gracefully generates deterministic, high-fidelity contextual documents for the selected Grand Prix.
*   **Unified F1 News Wire**: Parses live F1 RSS feeds to deliver up-to-the-minute paddock headlines, with categorized filtering supporting Silly Season Rumors & Transfers.

### 3. 📢 Admin Command & Announcement Station
*   **Global Timed Announcements**: Provides paddock administrators with a dedicated creation desk to draft urgent paddock bulletins and global notices.
*   **Auto-Expiration Control**: Select from custom expiration timers (5 min, 30 min, 1 hour, or 24 hours). The global top banner dynamically displays a countdown timer and sweeps expired notices.
*   **Fan Sentiment Polls**: Allows paddock fans to cast live sentiment votes, recorded directly to active local storage blocks with real-time percentage analytics.

---

## 🛠️ Quick Start Instructions

Get the F1 Paddock command center up and running on your local machine:

### Prerequisites
Make sure **Node.js** (v18 or higher) is installed on your workstation.

### 1. Installation
Install the necessary dependencies:
```bash
npm install
```

### 2. Development Mode
Boot up both the full-stack Express backend server and the Vite asset bundler:
```bash
npm run dev
```
Once started, the application will be hosted locally at `http://localhost:3000`.

### 3. Production Build
Compile the frontend client and bundle the CJS backend server using esbuild:
```bash
npm run build
```

To run the production-ready build:
```bash
npm run start
```

---

## 📊 Tech Stack Configuration
*   **Client**: React 18, Vite, Motion for fluid page and modal animations.
*   **Server**: Node.js, Express, TSX.
*   **Styling**: Responsive Tailwind CSS Utility Framework.
*   **Icons**: Lucide-React.
*   **Social Connections**: Official Paddock Telegram and Discord integrations are available in the sidebar of the terminal.

---

## 🚦 V1.4 Paddock Release Changelog
In addition to telemetry captures, this edition activates:
*   **Dynamic Custom Sidebar Panels (Beta)**: Control the visibility of individual sidebar tabs directly from user settings (User Hub). Core navigation pathways (Dashboard and User Hub) are locked by default to ensure structural continuity.
*   **Dual-Tier Verification Checkmarks**: Features standard blue verification checkmarks alongside elite purple verification styles for paddock contributors. Styled verifications are persistent and render dynamically across status sheets, chat modules, and leaderboards.
*   **Integrated Driver Biography Wikis**: Active driver rosters now feature direct pathways to Wikipedia biographies for all competitive players and team constructors.
*   **HLS `.m3u8` Stream Feed**: Integrates high-speed live HLS stream rendering for paddock races.

---