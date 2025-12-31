import React from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'admin' | 'sales_agent' | 'developer';

const MenuSidebar: React.FC = () => {
  const navigate=useNavigate()
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
      ],
    },
  ];

  const menuSections = allMenuSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.allowedRoles.includes(userRole))
  })).filter(section => section.items.length > 0);

  return (
    <div className="w-64 border border-gray-200 h-screen bg-background overflow-y-auto flex flex-col">
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
                  <button onClick={()=>{handlClick(item.route)}} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-foreground text-sm transition">
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
  );
};

export default MenuSidebar;
