import '../components/Navbar.css';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  onSearch: (query: string) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  darkMode?: boolean;
  setDarkMode?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  user,
  setUser,
  darkMode = false,
  setDarkMode,
}) => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
  };

  const handleLogout = () => {
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark-mode' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-left">
        <div
          className="navbar-logo"
          onClick={() => {
            navigate('/');
            setMenuOpen(false);
          }}
          role="button"
          aria-label="Go to home"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          TastyGram
        </div>
      </div>

      <div className="navbar-center">
        <ul className="navbar-links">
          <li><Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link></li>

          {user ? (
            <>
              <li><Link to="/upload" onClick={() => setMenuOpen(false)}>Upload</Link></li>
              <li><Link to="/my-recipes" onClick={() => setMenuOpen(false)}>My Recipes</Link></li>
            </>
          ) : (
            <>
              {/* keep Recipes visible; Login/Signup in center on large screens */}
              <li className="hidden-sm"><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li className="hidden-sm"><Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
              <li className="hidden-sm"><Link to="/guest" onClick={() => setMenuOpen(false)}>Guest</Link></li>
            </>
          )}
        </ul>
      </div>

      <div className="navbar-right">
        <div className="navbar-search" aria-hidden={false}>
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search recipes..."
            aria-label="Search recipes"
          />
        </div>

        {/* For logged in user show username and logout */}
        {user ? (
          <div className="user-actions">
            <span className="username" title={`Signed in as ${user.username}`}>{user.username}</span>
            <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
              Logout
            </button>
          </div>
        ) : (
          // on wide screens Login/Signup already in center; keep a compact link group for smaller screens
          <div className="auth-compact hidden-lg">
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="signup-cta">Sign Up</Link>
          </div>
        )}

        {setDarkMode && (
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(prev => !prev)}
            aria-pressed={darkMode}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}

        {/* Hamburger for mobile */}
        <button
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'active' : ''}`} role="menu" aria-hidden={!menuOpen}>
        <ul>
          <li><Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link></li>

          {user ? (
            <>
              <li><Link to="/upload" onClick={() => setMenuOpen(false)}>Upload</Link></li>
              <li><Link to="/my-recipes" onClick={() => setMenuOpen(false)}>My Recipes</Link></li>
              <li><button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
              <li><Link to="/guest" onClick={() => setMenuOpen(false)}>Guest</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
