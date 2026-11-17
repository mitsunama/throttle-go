import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Showroom', end: true },
  { to: '/transactions', label: 'Transactions' },
  { to: '/profile', label: 'Profile' },
];

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <NavLink to="/" className="brand">Throttle</NavLink>
        <nav aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
