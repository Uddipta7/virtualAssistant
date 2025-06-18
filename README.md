# 🤖 Zarvis – Your Virtual Assistant

**Zarvis** is your intelligent AI-powered virtual assistant built using the **MERN stack**, with seamless voice and text interaction powered by the **Gemini AI API**. Whether you want to have a conversation, do quick web tasks, hear a joke, or check the time — Zarvis is always ready!

With a beautiful, animated interface and a human-like assistant experience, Zarvis bridges the gap between smart technology and friendly interaction.

---

## 🔗 Live Demo

🚀 Try it now: [zarvis.render.app](https://virtualassistant-b9ko.onrender.com)

## 🌟 Features

🎤 **Always-On Voice Recognition**  
Just speak — no wake word required! Zarvis listens continuously and responds instantly.

🧠 **Conversational Intelligence (Gemini AI)**  
Ask anything! Gemini API handles natural language understanding to deliver helpful responses.

💬 **Dual Interaction Modes**  
Speak or type — switch effortlessly based on your preference.

🖼️ **Custom Assistant Name & Image**  
Personalize your assistant's name and avatar to match your vibe.

🌐 **Smart Web Actions**  
Say "Open YouTube" or "Search Google" — Zarvis opens websites for you in a new tab.

🕒 **Real-Time Info & Fun**  
Ask for the current time, date, or even crack a joke — Zarvis keeps it fun and informative.

🎨 **Stunning Animated UI**  
Includes:
- Waveform animation while listening 🎙️  
- Typewriter effect for replies ⌨️  
- Avatar reactions 🧑‍🚀  
- Responsive design with a clean layout
---

## 🛠️ Tech Stack

### ⚙️ Full Stack – **MERN**
- **MongoDB** – For storing user data and assistant preferences
- **Express.js** – Backend API routes
- **React.js** – Dynamic and animated user interface
- **Node.js** – Runtime environment for the server

### 🔮 AI Integration
- **Google Gemini API** – Handles all assistant responses

### 🗣️ Voice & Speech
- `Web Speech API`  
  - `SpeechRecognition` for voice input  
  - `speechSynthesis` for voice output

### 🎨 Frontend Stack
- **React.js**
- **Tailwind CSS** – For modern responsive UI
- **Framer Motion** – Smooth animations and transitions
- **React Icons** – Icons for UI elements
- **React Router DOM** – Routing between pages
- **Axios** – For API requests

### 🗄️ Backend Stack
- **Node.js + Express.js** – REST API
- **MongoDB** (via Mongoose) – Database
- **Cloudinary** – Image upload for avatar customization
- **CORS, dotenv, bcrypt** – Auth and config helpers

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Uddipta7/virtualAssistant.git
cd virtualAssistant
```
2. Install Dependencies
```bash
npm install
cd client
npm install
```
3. Set Up Environment Variables
In the root folder, create a .env file with:
```env
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
In the /client folder, create a .env with:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```
4. Run the App
# In root (backend)
```bash
npm run dev
```
# In /client (frontend)
```bash
npm run dev
```
🔧 Project Structure
```bash
├── client/              # React frontend
│   ├── components/
│   ├── context/
│   ├── assets/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── server/              # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── index.js
├── .env
└── README.md
