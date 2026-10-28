import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { loginSchema } from '@samudra/shared';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    try {
      setSubmitting(true);
      await login(parsed.data);
      navigate('/');
    } catch (err: unknown) {
      const axiosMsg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(axiosMsg || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-nivara-border bg-nivara-bg-card mb-3">
            <Waves size={28} className="text-nivara-text-primary" />
          </div>
          <h1 className="text-2xl font-manrope font-extrabold">Welcome back</h1>
          <p className="text-nivara-text-muted text-sm mt-1">Sign in to Samudra-Alert</p>
        </div>

        {error && (
          <div className="bg-nivara-danger/10 border border-nivara-danger/25 text-nivara-danger px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-xs font-bold text-nivara-text-secondary ml-1 uppercase">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nivara-text-muted" size={18} />
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input-field w-full pl-11" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="text-xs font-bold text-nivara-text-secondary ml-1 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nivara-text-muted" size={18} />
              <input id="login-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field w-full pl-11 pr-12" autoComplete="current-password" />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-nivara-text-muted hover:text-nivara-text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-nivara-text-secondary text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-nivara-accent-primary font-bold hover:underline">Register</Link>
        </p>

        <div className="mt-4 p-3 rounded-xl bg-nivara-bg-glass border border-nivara-border text-[11px] text-nivara-text-muted leading-relaxed">
          <strong className="text-nivara-text-secondary">Demo accounts</strong> (password <code className="text-nivara-danger">Password123!</code>):<br />
          admin@samudra-alert.in · moderator@samudra-alert.in · citizen@samudra-alert.in
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
