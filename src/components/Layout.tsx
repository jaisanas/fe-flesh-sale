import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo" aria-label="Flash Sale home">
            <span className="logo-mark">F</span>
            <span className="logo-text">flashpedia</span>
          </Link>

          <form className="search" onSubmit={handleSearch} role="search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search products on flashpedia…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </form>

          <nav className="nav" aria-label="Primary">
            {isAuthenticated ? (
              <>
                <NavLink to="/" end className="nav-link" title="Deals">
                  <FlashIcon />
                  <span>Deals</span>
                </NavLink>
                <NavLink to="/orders" className="nav-link" title="My orders">
                  <BagIcon />
                  <span>Orders</span>
                </NavLink>
                <span className="nav-divider" aria-hidden="true" />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} Flashpedia Marketplace</span>
          <span>Built with React + Vite</span>
        </div>
      </footer>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
