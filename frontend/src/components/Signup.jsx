import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/api/auth/register`, { username, email, password });
      setSuccess("Registration successful! Please log in.");
      setLoading(false);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-24"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#b993e6] via-[#7ed6df] to-[#f6e58d] bg-clip-text text-transparent">Sign Up for DC Portal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="rounded-lg px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#b993e6] text-lg"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="rounded-lg px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#b993e6] text-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-lg px-4 py-3 bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#b993e6] text-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {success && <div className="text-green-500 text-sm text-center">{success}</div>}
          <button
            type="submit"
            className="mt-2 rounded-full px-6 py-3 text-lg font-bold bg-gradient-to-r from-[#b993e6] to-[#7ed6df] text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-4 text-white/80">
          Already have an account? <Link to="/login" className="text-[#b993e6] font-semibold hover:underline">Login</Link>
        </div>
      </motion.div>
    </div>
  );
} 