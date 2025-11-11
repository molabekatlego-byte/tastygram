// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../firebase';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  darkMode?: boolean;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ darkMode = false, setUser }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('username', '==', username.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrors({ general: 'No account found with that username' });
        setLoading(false);
        return;
      }

      const docSnap = snapshot.docs[0];
      const userDoc = docSnap.data() as any;
      const storedHash = userDoc.hashedPassword ?? userDoc.hashed_password ?? userDoc.passwordHash;

      if (!storedHash) {
        setErrors({ general: 'This account does not have a password set.' });
        setLoading(false);
        return;
      }

      const ok = await bcrypt.compare(password, storedHash);
      if (!ok) {
        setErrors({ general: 'Invalid username or password' });
        setLoading(false);
        return;
      }

      const appUser: User = {
        id: docSnap.id,
        username: userDoc.username,
        email: userDoc.email ?? undefined,
        avatarUrl: userDoc.avatarUrl ?? undefined,
        userType: userDoc.userType ?? undefined,
        bio: userDoc.bio ?? undefined,
        name: userDoc.name ?? undefined,
      };

      // update app-level user if provided
      setUser?.(appUser);

      // clear form
      setUsername('');
      setPassword('');
      setErrors({});

      // redirect to recipes
      navigate('/recipes');
    } catch (err: any) {
      console.error('Login error', err);
      setErrors({ general: 'Login failed: ' + (err?.message ?? String(err)) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card(darkMode)} aria-label="Login form">
      <h2 style={styles.heading}>Welcome back</h2>

      {errors.general && <div style={styles.errorBox}>{errors.general}</div>}

      <label style={styles.label}>Username</label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="your username"
        style={styles.input(darkMode, !!errors.username)}
      />
      {errors.username && <div style={styles.fieldError}>{errors.username}</div>}

      <label style={styles.label}>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="your password"
        style={styles.input(darkMode, !!errors.password)}
      />
      {errors.password && <div style={styles.fieldError}>{errors.password}</div>}

      <button type="submit" disabled={loading} style={styles.primaryButton(darkMode, loading)}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;

/* Styling — matches SignupForm visual language (white & gold) */
const styles = {
  card: (dark = false) =>
    ({
      background: dark ? '#1f1f1f' : '#fff',
      padding: 24,
      borderRadius: 16,
      maxWidth: 400,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
    } as React.CSSProperties),
  heading: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: '#d4af37',
    textAlign: 'center',
  } as React.CSSProperties,
  label: { fontSize: 14, fontWeight: 600 } as React.CSSProperties,
  input: (dark = false, invalid = false) =>
    ({
      padding: '10px 12px',
      borderRadius: 8,
      border: invalid ? '1px solid #ff4d4f' : `1px solid ${dark ? '#444' : '#d4af37'}`,
      background: dark ? '#111' : '#fff',
      color: dark ? '#fff' : '#111',
      fontSize: 14,
    } as React.CSSProperties),
  primaryButton: (dark = false, disabled = false) =>
    ({
      marginTop: 8,
      padding: '10px 14px',
      borderRadius: 10,
      border: 'none',
      background: disabled ? '#9aa4af' : '#FFD700',
      color: '#111',
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
    } as React.CSSProperties),
  fieldError: { color: '#ff4d4f', fontSize: 12 } as React.CSSProperties,
  errorBox: {
    padding: '10px 12px',
    background: '#fff4f4',
    color: '#b62828',
    borderRadius: 8,
    fontSize: 13,
  } as React.CSSProperties,
};
