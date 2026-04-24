const CONFIG = {
  BACKEND_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://researchlens-backend.onrender.com/api'
};