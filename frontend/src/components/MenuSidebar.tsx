import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Role = 'admin' | 'sales_agent' | 'onboarding_agent' | 'sales_manager' | 'business_head' | 'developer';

interface MenuSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MenuSidebar: React.FC<MenuSidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role as Role;
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/dashboard', allowedRoles: ['admin', 'sales_agent', 'onboarding_agent', 'sales_manager', 'business_head', 'developer'] as Role[] },
    { name: 'Leads', icon: '📋', route: '/leads', allowedRoles: ['admin', 'sales_agent', 'sales_manager'] as Role[] },
    { name: 'Tasks', icon: '✅', route: '/tasks', allowedRoles: ['admin', 'sales_agent', 'onboarding_agent', 'sales_manager', 'business_head', 'developer'] as Role[] },
    { name: 'Communication', icon: '💬', route: '/communication', allowedRoles: ['admin', 'sales_agent', 'sales_manager'] as Role[] },
    { name: 'Projects', icon: '📁', route: '/projects', allowedRoles: ['admin', 'sales_agent', 'onboarding_agent', 'business_head', 'developer'] as Role[] },
    { name: 'Properties', icon: '🏠', route: '/property', allowedRoles: ['admin', 'sales_agent', 'onboarding_agent', 'business_head', 'developer'] as Role[] },
    { name: 'Developers', icon: '🏗️', route: '/developers', allowedRoles: ['admin', 'onboarding_agent', 'developer'] as Role[] },
    { name: 'Users', icon: '👥', route: '/users', allowedRoles: ['admin', 'sales_manager', 'business_head'] as Role[] },
    { name: 'Locations', icon: '📍', route: '/locations', allowedRoles: ['admin'] as Role[] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.allowedRoles.includes(userRole));

  // Handle body scroll lock for mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle swipe gestures to close sidebar
  useEffect(() => {
    if (!isOpen || !onClose) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;

      const diffX = startX - currentX;

      if (diffX > 50) {
        onClose();
      }

      isDragging = false;
      startX = 0;
      currentX = 0;
    };

    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
      sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
      sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('touchstart', handleTouchStart);
        sidebar.removeEventListener('touchmove', handleTouchMove);
        sidebar.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose]);

  const handleItemClick = (route: string) => {
    navigate(route);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed md:relative top-0 left-0 z-50 h-screen bg-background border-r border-gray-200
          w-64 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex border-b border-gray-200 items-center p-4">
          <div className="text-primary text-2xl">📊</div>
          <div className="ml-3">
            <div className="text-sm font-bold text-foreground">Avacasa</div>
            <p className="text-xs text-gray-500">CRM System</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenuItems.map((item, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleItemClick(item.route)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 text-foreground text-sm transition"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="border-t border-gray-200 p-4">
          {user?.name && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-600 text-sm transition"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuSidebar;
