import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

import '../App.css';

interface SideNavProps {
  setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarVisible: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ setSidebarVisible, sidebarVisible }) => {
  const navigate = useNavigate(); // For navigation

  const routes = [
    // { label: 'Dashboard', icon: 'pi pi-home', path: '/dashboard' },
    { label: 'Admin', icon: 'pi pi-users', path: '/admin' },
    { label: 'Customers', icon: 'pi pi-users', path: '/customers' },
  ];

  return (
    <div>
      <Button severity="secondary" icon="pi pi-bars" onClick={() => setSidebarVisible(true)} className="p-mr-2" />
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        position="left"
        className="p-sidebar-sm p-4"
      >
        {routes.map((route, index) => (
          <Button
            key={index}
            className="p-button-text w-full text-left mb-2"
            icon={route.icon}
            label={route.label}
            onClick={() => {
              navigate(route.path);
              setSidebarVisible(false);
            }}
          />
        ))}
      </Sidebar>
    </div>
  );
};

export default SideNav;