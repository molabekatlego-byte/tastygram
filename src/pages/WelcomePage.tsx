import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import food1 from '../assets/carbonara.jpg';
import food2 from '../assets/foods.jpg';
import food3 from '../assets/odos.jpeg';
import food4 from '../assets/oods.jpg';
import food5 from '../assets/sam.jpg';

import './WelcomePage.css';

const images = [food1, food2, food3, food4, food5];

interface WelcomePageProps {
  darkMode?: boolean;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ darkMode = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Parallax / subtle tilt effect using mouse position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (ev: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = el.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width - 0.5; // -0.5 -> 0.5
      const y = (ev.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--mx', String(x.toFixed(3)));
      el.style.setProperty('--my', String(y.toFixed(3)));
    };
    const handleLeave = () => {
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section
      className={`welcome-container ${darkMode ? 'dark' : 'light'}`}
      ref={containerRef}
      aria-label="Welcome to TastyGram"
    >
      {/* Decorative floating shapes (SVGs) */}
      <div className="decor decor-top-left" aria-hidden />
      <div className="decor decor-bottom-right" aria-hidden />

      {/* Image layers for crossfade + subtle parallax */}
      <div className="hero-images" aria-hidden>
        {images.map((img, idx) => {
          const offset = (idx - currentIndex + images.length) % images.length;
          const visible = idx === currentIndex;
          return (
            <div
              key={idx}
              className={`hero-image ${visible ? 'visible' : ''}`}
              style={{
                backgroundImage: `url(${img})`,
                transform: `translate3d(calc(var(--mx) * ${
                  -6 - offset * 2
                }px), calc(var(--my) * ${-6 - offset * 2}px), 0)`,
              }}
            />
          );
        })}
      </div>

      {/* Soft overlay for contrast */}
      <div className="hero-overlay" aria-hidden />

      {/* Main content card (Replaced hero-content wrapper) */}
      <div className="hero-card" role="region" aria-labelledby="welcome-title">
        <h1 id="welcome-title" className="hero-title">
          Welcome to <span className="brand">TastyGram</span>
        </h1>

        <p className="hero-sub">
          Your recipe passport to <span className="accent">flavor adventures</span>
          , served in a community of home cooks and chefs.
        </p>

        <p className="hero-lead">
          Discover authentic recipes, save your favorites, and share your
          culinary wins. Browse curated categories, or upload your signature
          dish — quick & beautiful.
        </p>

        <div className="hero-actions">
          <button
            className="btn primary"
            onClick={() => navigate('/recipes')}
            aria-label="Explore recipes"
          >
            Explore Recipes
          </button>

          <button
            className="btn ghost"
            onClick={() => navigate('/signup')}
            aria-label="Create account"
          >
            Create account
          </button>
        </div>

        <div className="hero-features" aria-hidden>
          <div className="feature">
            <strong>🔥 Trending</strong>
            <span>Top dishes from the community</span>
          </div>
          <div className="feature">
            <strong>💾 Saved</strong>
            <span>Save recipes for later</span>
          </div>
          <div className="feature">
            <strong>📤 Upload</strong>
            <span>Share your signature recipe</span>
          </div>
        </div>
      </div>

      {/* subtle scroll hint */}
      <button
        className="scroll-hint"
        onClick={() => {
          const el = document.querySelector('#recipes-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        aria-label="Scroll to recipes"
      >
        ⌄
      </button>
    </section>
  );
};

export default WelcomePage;