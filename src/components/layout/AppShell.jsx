import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, UtensilsCrossed, BarChart3, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/workout', icon: Dumbbell, label: 'Sport' },
  { path: '/nutrition', icon: UtensilsCrossed, label: 'Nutrition' },
  { path: '/academy', icon: BarChart3, label: 'Académie' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <nav className="bottom-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="bottom-nav__icon" size={22} strokeWidth={isActive ? 2.2 : 1.6} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            style={{ width: '100%', height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

