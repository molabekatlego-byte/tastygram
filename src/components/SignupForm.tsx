// src/components/SignupForm.tsx
import React, { useState } from 'react';
import { collection, doc, getDocs, query, setDoc, where, serverTimestamp } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../firebase';
import { User } from '../types';
import { useNavigate } from 'react-router-dom'; // <-- import for navigation

interface SignupFormProps {
  darkMode?: boolean;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
}

const USER_TYPES = ['user', 'chef', 'admin', 'guest'];

const SignupForm: React.FC<SignupFormProps> = ({ darkMode = false, setUser }) => {
  const navigate = useNavigate(); // <-- hook for redirect
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [userType, setUserType] = useState('user');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    if (password !== confirm) e.confirm = 'Passwords must match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isTaken = async (field: 'username' | 'email', value: string) => {
    const q = query(collection(db, 'users'), where(field, '==', value));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!validate()) return;

    setLoading(true);
    try {
      if (await isTaken('username', username)) {
        setErrors({ username: 'Username already taken' });
        setLoading(false);
        return;
      }
      if (await isTaken('email', email)) {
        setErrors({ email: 'Email already in use' });
        setLoading(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userRef = doc(collection(db, 'users'));
      const uid = userRef.id;

      const newUser: User = {
        id: uid,
        username,
        email,
        userType,
        bio: '',
        avatarUrl: '',
        name: username,
      };

      await setDoc(userRef, {
        ...newUser,
        hashedPassword,
        createdAt: serverTimestamp(),
      });

      setUser?.(newUser);
      setSuccessMsg('Account created successfully!');

      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setUserType('user');

      // Redirect to recipes page
      navigate('/recipes');
    } catch (err: any) {
      console.error('Signup error', err);
      setErrors({ general: 'Signup failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.card(darkMode)}>
      <h2 style={styles.heading}>Create Account</h2>

      {errors.general && <div style={styles.error}>{errors.general}</div>}
      {successMsg && <div style={styles.success}>{successMsg}</div>}

      <label style={styles.label}>Username</label>
      <input value={username} onChange={e => setUsername(e.target.value)} style={styles.input(darkMode, !!errors.username)} />
      {errors.username && <div style={styles.fieldError}>{errors.username}</div>}

      <label style={styles.label}>Email</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input(darkMode, !!errors.email)} />
      {errors.email && <div style={styles.fieldError}>{errors.email}</div>}

      <label style={styles.label}>User type</label>
      <select value={userType} onChange={e => setUserType(e.target.value)} style={styles.select(darkMode)}>
        {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <label style={styles.label}>Password</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input(darkMode, !!errors.password)} />
      {errors.password && <div style={styles.fieldError}>{errors.password}</div>}

      <label style={styles.label}>Confirm Password</label>
      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={styles.input(darkMode, !!errors.confirm)} />
      {errors.confirm && <div style={styles.fieldError}>{errors.confirm}</div>}

      <button type="submit" disabled={loading} style={styles.primaryButton(darkMode, loading)}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
};

export default SignupForm;

// Styles
const styles = {
  card: (dark = false) => ({
    background: dark ? '#1f1f1f' : '#fff',
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
  } as React.CSSProperties),
  heading: { fontSize: 24, fontWeight: 700 } as React.CSSProperties,
  label: { fontSize: 14, fontWeight: 600 } as React.CSSProperties,
  input: (dark = false, error = false) => ({
    padding: 10,
    borderRadius: 8,
    border: error ? '1px solid #ff4d4f' : '1px solid #ccc',
    background: dark ? '#2a2a2a' : '#fff',
    color: dark ? '#fff' : '#111',
  } as React.CSSProperties),
  select: (dark = false) => ({
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc',
    background: dark ? '#2a2a2a' : '#fff',
    color: dark ? '#fff' : '#111',
  } as React.CSSProperties),
  primaryButton: (dark = false, disabled = false) => ({
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    fontWeight: 700,
    border: 'none',
    background: disabled ? '#aaa' : '#FFD700', // gold
    color: dark ? '#1f1f1f' : '#111',
    cursor: disabled ? 'not-allowed' : 'pointer',
  } as React.CSSProperties),
  error: { color: '#ff4d4f', fontSize: 12 } as React.CSSProperties,
  success: { color: '#0b7d3b', fontSize: 12 } as React.CSSProperties,
  fieldError: { color: '#ff4d4f', fontSize: 12 } as React.CSSProperties,
};
