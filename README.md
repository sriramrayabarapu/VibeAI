# VibeAI 🎬🎵💬

AI-Powered Personalized Entertainment Platform.

## 🚀 Features

-   🎬 **Reels Section:** High-fidelity vertical video feed with dynamic double-tap likes, BOTTOM sheet comments (Instagram-style), deletion, and custom uploads.
-   🎵 **Music Section (Spotify Clone):** Premium dark-mode music hub featuring integrated audio streams (from Apple/iTunes catalog), mood filters, language tags (Telugu 🇮🇳, Hindi 🇮🇳, English 🌐), and persistent bottom player controls.
-   💬 **AI Assistant:** Direct integration with Gemini 2.5 Flash model via a local secure proxy server for intelligent chats.
-   📸 **Instagram-Style Profile:** Customizable biographies, persistent multi-user avatars, circular story highlights, and a 3-column post gallery grid with stat overlays and auto-scrolling play.
-   🔒 **Local Secure Storage:** Video blobs are stored directly inside IndexedDB for high quota allocation, and metadata/avatars are managed in localStorage.

## 🛠️ Tech Stack

-   **Frontend:** Pure HTML5, Vanilla CSS3 (curated harmonies, sleek dark modes, glassmorphism), and Vanilla JavaScript.
-   **Backend:** Node.js, Express, CORS (Proxy server).
-   **Storage:** LocalStorage & IndexedDB (W3C Standard).

## 💻 How to Run Locally

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sriramrayabarapu/VibeAI.git
    cd VibeAI
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Server:**
    ```bash
    node server.js
    ```
    The app will run locally at **http://localhost:3000**.
