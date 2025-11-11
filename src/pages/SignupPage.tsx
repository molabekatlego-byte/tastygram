// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import SignupForm from '../components/SignupForm';
import { User } from '../types';

interface SignupPageProps {
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  darkMode?: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ setUser, darkMode = false }) => {
  const [internalDarkMode, setInternalDarkMode] = useState(darkMode);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: internalDarkMode
          ? '#1f1f1f'
          : 'linear-gradient(to bottom right, #ffffff, #fdf7f0)',
        fontFamily: "'Poppins', sans-serif",
        transition: 'background 0.4s ease',
        padding: '1rem',
      }}
    >
      {/* Dark mode toggle */}
      <button
        onClick={() => setInternalDarkMode(!internalDarkMode)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: internalDarkMode ? '#fef3c7' : '#111827',
          color: internalDarkMode ? '#111827' : '#fef3c7',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        {internalDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Signup Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          background: internalDarkMode ? '#2a2a2a' : '#fff',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: internalDarkMode
            ? '0 12px 30px rgba(0,0,0,0.6)'
            : '0 12px 30px rgba(0,0,0,0.15)',
          color: internalDarkMode ? '#f3f4f6' : '#111827',
          transition: 'all 0.4s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: internalDarkMode ? '#fbbf24' : '#d4af37', // gold
            marginBottom: '1.5rem',
          }}
        >
          Create Your Account
        </h1>

        {/* Signup Form */}
        <SignupForm
          setUser={setUser}
          darkMode={internalDarkMode}
        />
      </div>
    </div>
  );
};

export default SignupPage;
