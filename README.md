# 🏟️ FanCheers (FanPulse) — Real-Time Global Sports Atmosphere Layer

FanCheers is the **Atmosphere Layer** for global live sports. While video platforms stream broadcasts and stat apps show tables, FanCheers synchronizes thousands of passionate fans in real time across the globe through tactile live cheers, acoustic TV synchronization, real-time momentum waveforms, chant engines, and competitive city territory maps.

🔗 **Repository:** [https://github.com/hukku1anshul/fancheers](https://github.com/hukku1anshul/fancheers)  
📱 **Direct Android App Download:** `https://<your-render-url>/download/apk` (or `/fanpulse.apk`)

---

## 🚀 One-Click Deploy to Render

FanCheers includes a complete `render.yaml` Blueprint spec for automated CI/CD deployment on Render.

### Option A: Automatic Deploy via Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
2. Connect your GitHub repository: `hukku1anshul/fancheers`.
3. Render will automatically detect `render.yaml` and configure the web service with:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** `20.18.0`
   - **Auto-Deploy:** Enabled on every `git push` to `main`.
4. Click **Apply**. Within minutes your app will be live with full WebSocket support and direct APK download!

### Option B: Manual Web Service Setup
1. On Render, click **New +** → **Web Service**.
2. Select your repository `hukku1anshul/fancheers`.
3. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Deploy!

---

## 📱 Native Android App (Included in Repository)

The production-ready debug APK is stored in `server/public/fanpulse-mobile.apk` and `client/public/fanpulse-mobile.apk`.

### How to Download & Install
1. Once deployed to Render, open your mobile browser and navigate to:
   ```
   https://<your-render-app>.onrender.com/download/apk
   ```
2. Or click the **📱 APK** button in the top navigation bar of the web app.
3. Download the 4.17 MB APK and tap to install on any Android phone (API 24 to 35+ supported).

---

## ⚡ Local Development

### 1. Install & Build All
```bash
npm run install:all
npm run build
```

### 2. Start Full Stack Server (Unified Mode)
```bash
npm start
```
* Web App: [http://localhost:3001](http://localhost:3001)
* API Health: [http://localhost:3001/api/health](http://localhost:3001/api/health)
* APK Download: [http://localhost:3001/download/apk](http://localhost:3001/download/apk)

### 3. Or Run in Dev Mode
* **Backend:** `cd server && npm run dev` (Port 3001)
* **Frontend:** `cd client && npm run dev` (Port 5173 with proxy)

---

## 🌟 Key Features

1. **100% Genuine Sports Data**: 80+ real matches continuously polled from live ESPN public APIs (EPL, UCL, MLS, MLB, NBA, WNBA, NFL, NHL, ATP Tennis, ESPN Cricket) with zero simulated bots or fake fixtures.
2. **Real Athlete Rosters & Key Events**: Dynamic ESPN match intelligence displaying real starting lineups, jersey numbers, and live event timelines (goals, cards, substitutions).
3. **🎙️ Acoustic TV Auto-Sync**: Microphone ambient analyzer that listens to 3 seconds of TV room audio to automatically calibrate broadcast latency (0s–45s).
4. **🍻 Stadium & Terrace Pub Geofencing**: GPS check-in at verified venues and sports bars unlocking 2x Fan XP.
5. **📺 Creator OBS Stream HUD**: Transparent browser source overlay (`?mode=overlay`) for Twitch/YouTube streamers.
6. **💬 Live Stadium Wall**: Real-time WebSocket chat and emoji reactions with server-side XSS sanitization and rate-limiting.
7. **🔒 Hardened Security**: Helmet.js headers, Express rate limiting, buffer caps, and zero production vulnerabilities.
