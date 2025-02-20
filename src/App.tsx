import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Customers from './pages/Customers';
import CustomerAccounts from './pages/CustomerAccounts';
import Admin from './pages/Admin';
import SubCustomers from './pages/SubCustomers';

import 'primereact/resources/themes/lara-dark-blue/theme.css'; // Change theme here
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';


const App: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);

  // Close sidebar when clicking outside (mobile optimization)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarVisible && !document.getElementById('sidebar')?.contains(event.target as Node)) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarVisible]);

  return (
    <Router>
      <div className="app-container">
        <SideNav setSidebarVisible={setSidebarVisible} sidebarVisible={sidebarVisible} />
        <div className={`content ${sidebarVisible ? 'shifted' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/accounts/:customerId" element={<CustomerAccounts />} />
            <Route path="/accounts/:customerId/:subCustomerId" element={<CustomerAccounts />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/subcustomers/:customerId" element={<SubCustomers />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
