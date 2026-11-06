import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarClock, Upload, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LINKS = [
  { to: '/app', label: 'Jobs', icon: LayoutGrid, end: true },
  { to: '/claims', label: 'Claims', icon: CalendarClock },
  { to: '/import', label: 'Add a quote', icon: Upload },
];

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b-[3px] border-foreground bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-2.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center bg-accent font-heading text-[16px] font-extrabold text-foreground">
              TC
            </span>
            <span className="font-heading text-[22px] font-extrabold uppercase leading-none tracking-[0.02em]">TradeClaim</span>
          </Link>

          <nav className="ml-8 hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-2 font-heading text-[18px] font-bold uppercase tracking-[0.02em] transition-colors ${
                    isActive ? 'bg-foreground text-background' : 'text-foreground hover:bg-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[13px] text-muted-foreground sm:block">{user ? user.full_name || user.email : ''}</span>
            <button type="button" onClick={handleLogout} className="btn-small" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-foreground bg-background md:hidden">
        <div className="grid grid-cols-3">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-1 font-heading text-[15px] font-bold uppercase tracking-[0.04em] ${
                    isActive ? 'bg-foreground text-accent' : 'text-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {link.label.split(' ')[0] === 'Add' ? 'Quote' : link.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
