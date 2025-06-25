import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Lottie from "lottie-react";
import compressAnim from "../assets/lottie/compress.json";
import decompressAnim from "../assets/lottie/decompress.json";
import infoAnim from "../assets/lottie/info.json";
import { Tooltip } from "../components/ui/tooltip";
// import useSound from "use-sound";
// import clickSfx from "../assets/sounds/click.mp3";

import { useCallback, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  // const [play] = useSound(clickSfx, { volume: 0.2 });

  const logoRef = useRef(null);
  const heroTitle = "Breakthrough File Compression";
  const words = heroTitle.split(" ");

  // Parallax for blob
  const blobRef = useRef(null);
  const { scrollY } = useScroll();
  // More noticeable parallax: vertical and a bit of horizontal
  const blobY = useTransform(scrollY, [0, 400], [0, 250]);
  const blobX = useTransform(scrollY, [0, 400], [0, 40]);

  // Particles config
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526]">
      {/* Animated Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" }, resize: true },
            modes: { repulse: { distance: 100, duration: 0.4 } },
          },
          particles: {
            color: { value: ["#b993e6", "#7ed6df", "#f6e58d", "#fff"] },
            links: { enable: true, color: "#fff", distance: 150, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1, outModes: { default: "bounce" } },
            number: { value: 60, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 4 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Floating Navbar */}
      <motion.header
        className="fixed top-0 left-0 w-full z-20 flex items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md shadow-lg"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        {/* 3D Animated Logo with Tooltip */}
        <Tooltip text="Home">
          <motion.div
            ref={logoRef}
            className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#b993e6] via-[#7ed6df] to-[#f6e58d] bg-clip-text text-transparent drop-shadow-lg cursor-pointer select-none"
            whileHover={{ rotateY: 20, rotateX: 10, scale: 1.1, textShadow: "0px 4px 32px #b993e6" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ perspective: 600, display: 'inline-block' }}
          >
            DC Portal
          </motion.div>
        </Tooltip>
        <nav className="flex gap-4">
          <Link to="/login">
            <Button
              variant="outline"
              className="transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[#b993e6] hover:to-[#7ed6df] hover:text-white"
              // onClick={play}
            >
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button
              className="transition-all duration-300 bg-gradient-to-r from-[#b993e6] to-[#f6e58d] text-white shadow-lg hover:scale-105 hover:shadow-2xl"
              // onClick={play}
            >
              Sign Up
            </Button>
          </Link>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-[80vh] pt-32 relative z-10 overflow-hidden">
        {/* Animated Blob Background with Parallax */}
        <motion.svg
          ref={blobRef}
          width="700" height="500" viewBox="0 0 700 500" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-60 z-0 pointer-events-none"
          initial={{ scale: 1, rotate: 0, x: '-50%', y: '-50%' }}
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 8, -8, 0],
          }}
          style={{ y: blobY, x: blobX }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <defs>
            <linearGradient id="blobGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b993e6" />
              <stop offset="100%" stopColor="#7ed6df" />
            </linearGradient>
          </defs>
          <path
            d="M 350 60 Q 600 100 600 250 Q 600 400 350 440 Q 100 400 100 250 Q 100 100 350 60 Z"
            fill="url(#blobGradient)"
          />
        </motion.svg>
        {/* Scroll-triggered text transitions (pure React) */}
        <h1
          className="relative z-10 text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-[#b993e6] via-[#7ed6df] to-[#f6e58d] bg-clip-text text-transparent drop-shadow-[0_4px_32px_rgba(185,147,230,0.5)] flex flex-wrap justify-center gap-2"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ delay: i * 0.08, duration: 0.6, type: "spring" }}
              className="inline-block transition-all duration-300 cursor-pointer hover:text-white hover:drop-shadow-lg"
            >
              {word + " "}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Compress and decompress files with advanced algorithms. Fast, secure, and beautiful.
        </motion.p>
        <motion.div
          className="flex gap-6 mb-12"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
        >
          <Tooltip text="Start compressing now!">
            <MagneticButton>
              <Link to="/login">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-4 text-lg font-bold bg-gradient-to-r from-[#b993e6] to-[#7ed6df] text-white shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </MagneticButton>
          </Tooltip>
          <Link to="/signup">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-4 text-lg font-bold border-2 border-[#b993e6] text-[#b993e6] bg-white/10 hover:bg-gradient-to-r hover:from-[#b993e6] hover:to-[#f6e58d] hover:text-white transition-all duration-300"
            >
              Sign Up
            </Button>
          </Link>
        </motion.div>
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 16, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
            <path d="M16 8v16M16 24l-6-6M16 24l6-6" stroke="#b993e6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </section>

      {/* Interactive Cards */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-8 mb-20">
        {[
          {
            title: "Compress Files",
            desc: "Reduce file size using Huffman, RLE, LZ77, LZW, Brotli and more.",
            anim: compressAnim,
            cta: "Try Compression →",
            link: "/login",
          },
          {
            title: "Decompress Files",
            desc: "Restore your files to their original state with a single click.",
            anim: decompressAnim,
            cta: "Try Decompression →",
            link: "/login",
          },
          {
            title: "How It Works",
            desc: "Learn about the algorithms and technology powering the portal.",
            anim: infoAnim,
            cta: "Learn More →",
            link: "/login",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            className="group"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 * i, duration: 0.7, type: "spring" }}
          >
            <Card className="relative bg-white/10 backdrop-blur-lg border-none shadow-2xl rounded-3xl p-8 flex flex-col items-start transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_32px_rgba(185,147,230,0.3)]">
              <div className="mb-4 w-16 h-16">
                <Lottie animationData={card.anim} loop={true} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white drop-shadow">{card.title}</h2>
              <p className="text-white/80 mb-4">{card.desc}</p>
              <Link to={card.link} className="mt-auto">
                <Button
                  variant="ghost"
                  className="text-[#b993e6] font-semibold text-lg px-0 hover:text-[#7ed6df] transition-all duration-300"
                  // onClick={play}
                >
                  {card.cta}
                </Button>
              </Link>
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10" style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }} />
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Showcase Carousel (Sample Compression Stats) */}
      <section className="relative z-10 max-w-3xl mx-auto mb-24">
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h3 className="text-xl font-bold mb-4 text-white">Recent Compression Results</h3>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {[
              { file: "report.pdf", before: "2.4 MB", after: "1.1 MB", algo: "Brotli" },
              { file: "data.csv", before: "800 KB", after: "120 KB", algo: "LZ77" },
              { file: "image.png", before: "1.2 MB", after: "900 KB", algo: "RLE" },
            ].map((stat, i) => (
              <motion.div
                key={stat.file}
                className="min-w-[180px] bg-gradient-to-br from-[#b993e6]/80 to-[#7ed6df]/80 rounded-xl p-4 text-white shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.2 * i, duration: 0.6 }}
              >
                <div className="font-semibold">{stat.file}</div>
                <div className="text-sm">Algorithm: <span className="font-bold">{stat.algo}</span></div>
                <div className="mt-2 text-xs">Before: <span className="font-bold">{stat.before}</span></div>
                <div className="text-xs">After: <span className="font-bold">{stat.after}</span></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center text-white/60 text-sm py-8 border-t border-white/10 mt-auto z-20 relative">
        © {new Date().getFullYear()} DC Portal. All rights reserved.
      </footer>
    </div>
  );
}

function MagneticButton({ children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.25, y: y * 0.25 });
  }
  function handleMouseLeave() {
    setPos({ x: 0, y: 0 });
    setHovered(false);
  }
  return (
    <motion.div
      ref={ref}
      style={{ display: 'inline-block' }}
      animate={hovered ? { x: pos.x, y: pos.y, scale: 1.06 } : { x: 0, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      onMouseMove={e => { setHovered(true); handleMouseMove(e); }}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}