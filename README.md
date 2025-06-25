# 🚀 Data Compression & Decompression Portal
- DEPLOYED-LINK: https://dcp-frontend.onrender.com/

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-%20-green)

> **A modern, full-stack web app to compress & decompress files with advanced algorithms, beautiful UI, and real-time statistics.**

---

## 🌟 Overview
This portal lets you upload files, choose from multiple compression algorithms (Huffman, RLE, LZ77, LZW, Brotli), and instantly compress or decompress your data. Visualize compression stats, download results, and explore how modern algorithms work—all in a stunning, interactive interface.

---

## ✨ Features
- **🔼 File Upload:** Upload any file (text, image, binary)
- **🧩 Multiple Algorithms:** Huffman, RLE, LZ77, LZW, Brotli
- **🔄 Compress & Decompress:** One-click operations
- **📊 Compression Stats:** Ratio, original size, compressed size, processing time
- **⬇️ Download Results:** Get your processed files instantly
- **📚 Algorithm Explanations:** Learn how each algorithm works
- **🧠 Modern UI/UX:** Animated hero, parallax, tooltips, magnetic buttons, glassmorphism, custom scrollbars
- **🧑‍💻 User Auth & History:** Register/login, view your compression history
- **⚠️ Error Handling:** Friendly feedback for unsupported files or errors
- **📱 Responsive:** Works beautifully on desktop & mobile

---

## 🛠️ Tech Stack
**Frontend:**
- React.js, Vite, Tailwind CSS, Framer Motion, Chart.js, Lottie, shadcn/ui

**Backend:**
- Node.js, Express.js, Multer, Custom JS Algorithms (Huffman, RLE, LZ77, LZW, Brotli)

**Database:**
- MongoDB (user info, file metadata, history)

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/data-compression-portal.git
cd data-compression-portal
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install
# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment
- Copy `.env.example` to `.env` in `/backend` and set your MongoDB URI and JWT secret.

### 4. Run the app (Development)
```bash
# In one terminal (backend)
cd backend
npm run dev
# In another terminal (frontend)
cd ../frontend
npm run dev
```
- DEPLOYED-LINK: https://dcp-frontend.onrender.com/
  

### 5. Build for Production
```bash
cd frontend
npm run build
# Serve the built frontend from backend
cd ../backend
npm start
```

---

## 🌐 Hosting & Deployment

### Frontend
- **Vercel** or **Netlify** (recommended for React/Vite apps)
  1. Push your code to GitHub.
  2. Go to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) and create a new project.
  3. Connect your repo, set build command to `npm run build` and output directory to `dist`.
  4. Deploy!

### Backend
- **Render**, **Railway**, or **Heroku** (recommended for Node.js/Express)
  1. Push your backend code to GitHub.
  2. Go to [Render](https://render.com/), [Railway](https://railway.app/), or [Heroku](https://heroku.com/) and create a new web service.
  3. Connect your repo, set the start command to `npm start` or `node app.js`.
  4. Add environment variables (MongoDB URI, JWT secret, etc.) in the dashboard.
  5. Deploy!

**Tips:**
- Set your backend API URL in the frontend (e.g., VITE_API_URL) for production.
- Both Vercel/Netlify and Render/Railway/Heroku provide free HTTPS and custom domain support.

---

## 🖼️ Screenshots
> _Add your own screenshots below!_

| Landing Page | Compression Stats | History |
|:---:|:---:|:---:|
| ![Landing](./screenshots/landing.png) | ![Stats](./screenshots/stats.png) | ![History](./screenshots/history.png) |

---

## 📚 Algorithm Explanations
- **Huffman Coding:** Optimal prefix coding for lossless compression. Best for text files with repeated characters.
- **Run-Length Encoding (RLE):** Simple compression for data with repeated values. Good for images with large uniform areas.
- **LZ77:** Sliding window-based compression. Good for general-purpose compression.
- **LZW:** Dictionary-based compression ideal for text and repetitive data.
- **Brotli:** Modern, high-performance compression. Excellent for web content.

---

## 🙏 Credits
- UI inspired by [godly.website](https://godly.website/)
- Built with ❤️ by [Your Name]

---

## 📄 License
[MIT](./LICENSE) 
