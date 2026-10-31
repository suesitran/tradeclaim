import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarClock, Upload, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LINKS = [
  { to: '/app', label: 'Jobs', icon: LayoutGrid, end: true },
  { to: '/claims', label: 'Claims', icon: CalendarClock },
  { to: '/import', label: 'Import a quote', icon: Upload },
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[3px] bg-primary font-mono text-[11px] font-semibold tracking-tight text-primary-foreground">
              SK
            </span>
            <span className="leading-none">
              <span className="block font-heading text-[15px] font-semibold tracking-tight">Survival Kit</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Payment claims, Australia</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-[3px] px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">{user ? user.full_name || user.email : ''}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-[3px] border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    isActive ? 'text-accent' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {link.label.split(' ')[0]}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}