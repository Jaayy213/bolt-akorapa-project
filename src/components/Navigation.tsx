import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, CheckSquare, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function Navigation() {
  const location = useLocation();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-surface-glass backdrop-blur-glass border-b border-border-subtle sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-display font-bold">
            Akorapa
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-accent-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden md:inline">Admin</span>
                </Link>

                <Link
                  to="/resolve"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/resolve')
                      ? 'bg-accent-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="hidden md:inline">Resolve</span>
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:block text-sm">
                  <div className="text-text-primary font-medium">{user.email}</div>
                  {profile && (
                    <div className="text-text-secondary text-xs">
                      {profile.subscription_tier !== 'free' ? (
                        <span className="text-signal-success">
                          {profile.subscription_tier} subscription
                        </span>
                      ) : (
                        'Free tier'
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary rounded-lg hover:bg-accent-primary/80 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
