import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { registerSchema } from '@samudra/shared';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    try {
      await register(parsed.data);
      navigate('/');
    } catch (err: unknown) {
      const axiosMsg =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(axiosMsg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-nivara-border bg-nivara-bg-card mb-3">
            <Waves size={28} className="text-nivara-text-primary" />
          </div>
          <h1 className="text-2xl font-manrope font-extrabold">Join Samudra-Alert</h1>
          <p className="text-nivara-text-muted text-sm mt-1">Report incidents. Keep your city safe.</p>
        </div>

        {error && (
          <div className="bg-nivara-danger/10 border border-nivara-danger/25 text-nivara-danger px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="text-xs font-bold text-nivara-text-secondary ml-1 uppercase">Full name</label>
            <div className="relative mt-1">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-nivara-text-muted" size={18} />
              <input id="register-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="input-field w-full pl-11" />
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="text-xs font-bold text-nivara-text-secondary ml-1 uppercase">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-nivara-text-muted" size={18} />
              <input id="register-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="input-field w-full pl-11" />
            </div>
          </div>

          <div>
            <label htmlFor="register-password" className="text-xs font-bold text-nivara-text-secondary ml-1 uppercase">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nivara-text-muted" size={18} />
              <input id="register-password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="At least 6 characters" className="input-field w-full pl-11" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2">
            <UserPlus size={18} /> Create Account
          </button>
        </form>

        <p className="text-center mt-6 text-nivara-text-secondary text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-nivara-accent-primary font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
