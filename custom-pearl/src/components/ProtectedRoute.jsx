import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { API_URL } from "../config";
const INACTIVITY_MS = 2 * 60 * 1000;

const ProtectedRoute = ({ children }) => {
  const [user, setUser]       = useState(undefined); // undefined = loading
  const [timedOut, setTimedOut] = useState(false);
  const timerRef              = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setTimedOut(true);
      await signOut(auth);
    }, INACTIVITY_MS);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) resetTimer();
    });
    return () => { unsub(); clearTimeout(timerRef.current); };
  }, [resetTimer]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousemove','mousedown','keydown','touchstart','scroll','click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetTimer));
  }, [user, resetTimer]);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-pink-600 font-bold text-xl">Checking authorisation…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={timedOut ? { message: 'You were logged out due to inactivity.' } : undefined} />;
  }

  return children;
};

export default ProtectedRoute;
