# PhosTrack - Phosphate Tracker for CKD Stage 5

A specialized application for tracking daily phosphate intake, designed for patients with Chronic Kidney Disease (CKD) Stage 5.

## 🚀 Local Development

Follow these steps to run the project on your machine:

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Gemini API Key**: Get one for free at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Setup
1. Clone or download the project files.
2. Open your terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a file named `.env` in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Run
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000` (or the port shown in your terminal).

---

## 🌐 Deployment (Free Hosting)

The easiest way to host this React SPA for free is using **Vercel** or **Netlify**.

### Option A: Vercel (Recommended)
1. Push your code to a **GitHub** repository.
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New"** -> **"Project"**.
4. Import your GitHub repository.
5. In the **"Environment Variables"** section, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_actual_api_key_here`
6. Click **"Deploy"**. Vercel will automatically detect Vite settings.

### Option B: Netlify
1. Push your code to **GitHub**.
2. Log in to [Netlify](https://netlify.com).
3. Click **"Add a new site"** -> **"Import an existing project"**.
4. Connect to GitHub and select your repo.
5. In **"Site configuration"** -> **"Environment variables"**, add `GEMINI_API_KEY`.
6. Build settings (should be auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **"Deploy site"**.

### Important Note on Security
Since this is a client-side application (SPA), the API key is technically visible in the browser's network tab. For a production-grade app, it is recommended to use a backend proxy (Express) to hide the key. This app is currently configured as a high-performance SPA for demonstration.
