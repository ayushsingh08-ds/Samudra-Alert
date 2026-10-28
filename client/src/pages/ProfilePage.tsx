import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { User as UserIcon, LogOut, Database, ShieldCheck, BellRing, ChevronRight, Info } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOfflineStore } from '../store/useOfflineStore';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const queue = useOfflineStore((s) => s.queue);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/push-notifications').then(({ PushNotifications }) =>
        PushNotifications.checkPermissions(),
      );
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/offline', icon: Database, label: 'Offline Queue', detail: `${queue.length} queued`, show: true },
    { to: '/alerts', icon: BellRing, label: 'Notifications', detail: '', show: true },
    { to: '/dashboard', icon: ShieldCheck, label: 'Moderation Queue', detail: 'moderator / admin', show: user?.role === 'moderator' || user?.role === 'admin' },
    { to: '/admin/alerts', icon: ShieldCheck, label: 'Alert Composer', detail: 'admin only', show: user?.role === 'admin' },
  ].filter((l) => l.show);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-5 pb-8">
      <header className="glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-nivara-accent-primary/15 border border-nivara-accent-primary/30 flex items-center justify-center text-nivara-accent-primary">
          <UserIcon size={30} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-manrope font-extrabold truncate">{user?.name ?? 'Guest'}</h1>
          <p className="text-sm text-nivara-text-muted truncate">{user?.email ?? 'Sign in to report hazards'}</p>
          {user?.role && (
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-nivara-accent-primary/30 bg-nivara-accent-primary/10 text-nivara-accent-primary">
              {user.role}
            </span>
          )}
        </div>
      </header>

      <div className="glass-card divide-y divide-nivara-border overflow-hidden">
        {links.map(({ to, icon: Icon, label, detail }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 p-4 hover:bg-nivara-bg-glass transition-colors text-left"
          >
            <Icon size={20} className="text-nivara-accent-primary shrink-0" />
            <span className="flex-1 font-bold text-sm">{label}</span>
            {detail && <span className="text-[10px] text-nivara-text-muted uppercase">{detail}</span>}
            <ChevronRight size={16} className="text-nivara-text-muted" />
          </button>
        ))}
        <div className="flex items-center gap-3 p-4 opacity-60">
          <Info size={20} className="text-nivara-text-muted shrink-0" />
          <span className="flex-1 font-bold text-sm">App version</span>
          <span className="text-xs text-nivara-text-muted">2.0.0 {Capacitor.isNativePlatform() ? '· native' : '· web'}</span>
        </div>
      </div>

      {user ? (
        <button onClick={handleLogout} className="btn-secondary w-full flex items-center justify-center gap-2 !py-3 text-nivara-danger">
          <LogOut size={18} /> Log out
        </button>
      ) : (
        <button onClick={() => navigate('/login')} className="btn-primary w-full !py-3">
          Sign in
        </button>
      )}
    </div>
  );
};

export default ProfilePage;
