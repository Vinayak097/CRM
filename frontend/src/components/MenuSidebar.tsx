import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'admin' | 'sales_agent' | 'developer';

interface MenuSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MenuSidebar: React.FC<MenuSidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role as Role;

  function handlClick(route:any){
    navigate(route)

  }

  const allMenuSections = [
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Leads', icon: '📋' , route:'/leads', allowedRoles: ['admin', 'sales_agent'] as Role[] },
        { name: 'Users', icon: '👥' ,route:'/users', allowedRoles: ['admin'] as Role[] },
        { name: 'Properties', icon: '🏠' ,route:'/property', allowedRoles: ['admin', 'developer'] as Role[] },
        { name: 'Locations', icon: '📍' ,route:'/locations', allowedRoles: ['admin'] as Role[] },
        { name: 'Developers', icon: '🏗️' ,route:'/developers', allowedRoles: ['admin', 'developer'] as Role[] }

      ],
    },
  ];

  const menuSections = allMenuSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.allowedRoles.includes(userRole))
  })).filter(section => section.items.length > 0);

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

      // If swiped left by more than 50px, close sidebar
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
    handlClick(route);
    if (onClose) onClose(); // Close sidebar on mobile after navigation
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
          w-64 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out
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

        {/* Menu Sections */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <button
                      onClick={() => handleItemClick(item.route)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-foreground text-sm transition"
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default MenuSidebar;
