# 🚀 Data Compression & Decompression Portal

A fullstack web application for compressing and decompressing files using multiple algorithms. Built with React (Vite) frontend and Node.js/Express backend, deployed on Render.

---

## 🌐 Live Demo

- **Frontend:** [https://dcp-frontend.onrender.com](https://dcp-frontend.onrender.com)
- **Backend:** [https://dcp-backend-617c.onrender.com](https://dcp-backend-617c.onrender.com)

---

## 📖 Project Overview

This portal allows users to:
- Register and log in securely
- Upload files for compression or decompression
- Choose from multiple algorithms (Huffman, RLE, LZ77, LZW, Brotli)
- View and manage their compression history
- Download processed files

The app is designed for both educational and practical use, demonstrating how different compression algorithms work and their effectiveness.

---

## 🧩 Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Multer, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT (JSON Web Tokens), bcryptjs
- **Deployment:** Render.com

---

## 📦 Features
- User authentication (sign up, login, JWT-based sessions)
- File upload with drag-and-drop
- Compression and decompression using:
  - Huffman Coding
  - Run-Length Encoding (RLE)
  - LZ77
  - LZW
  - Brotli
- Download compressed/decompressed files
- Compression history (view, clear, download)
- Responsive, modern UI with animations
- Error handling and user feedback

---

## 🗂️ Project Structure
```
DCP/
  backend/
    algorithms/
    controllers/
    middleware/
    models/
    routes/
    uploads/
    app.js
    ...
  frontend/
    src/
      components/
      App.jsx
      ...
    public/
    ...
  render.yaml
  README.md
```

---

## 🛠️ Local Development

### 1. Clone the repository
```sh
git clone https://github.com/ayush7125/DCP.git
cd DCP
```

### 2. Setup Backend
```sh
cd backend
npm install
# Create a .env file (see below for example)
node app.js
```

### 3. Setup Frontend
```sh
cd ../frontend
npm install
# Create a .env file (see below for example)
npm run dev
```

### 4. Example .env Files
**backend/.env**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```
**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Deployment (Render)

### 1. Deploy Backend
- Create a new Web Service on Render
- Set root directory to `backend`
- Set build command: `npm install`
- Set start command: `node app.js`
- Add environment variables as above

### 2. Deploy Frontend
- Create a new Web Service on Render
- Set root directory to `frontend`
- Set build command: `npm install && npm run build`
- Set start command: `npm run preview -- --port $PORT`
- Add environment variable: `VITE_API_URL` (pointing to your backend Render URL)

---

---

## 🧑‍💻 Contributing
1. Fork this repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a Pull Request

---

## 🐞 Troubleshooting
- **404 errors:** Ensure all API calls in the frontend use `/api/...` after the backend URL.
- **CORS issues:** Check that `FRONTEND_URL` in backend `.env` matches your frontend URL.
- **MongoDB errors:** Verify your `MONGODB_URI` is correct and your IP is whitelisted in MongoDB Atlas.
- **Port issues on Render:** Make sure Vite preview is set to `host: true` in `vite.config.js`.

---

## 📄 License
MIT

---

## 👤 Author
- [ayush7125](https://github.com/ayush7125)
