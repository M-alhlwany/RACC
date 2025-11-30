import { NavLink, useNavigate } from 'react-router-dom';

const menu = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/deeds', label: 'إدارة الصكوك' },
  { to: '/owners', label: 'الملاك' },
  { to: '/contracts', label: 'العقود' },
  { to: '/payments', label: 'المدفوعات' }
];

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-circle">R</div>
          <div>
            <div className="logo-title">Romooz Admin</div>
            <div className="logo-subtitle">لوحة تحكم المكتب</div>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">لوحة التحكم</div>
          <div className="topbar-user">
            <span className="user-avatar">M</span>
            <span className="user-name">Mohmed Elshemy</span>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
