import React from 'react';
import { Card } from 'primereact/card';

import '../styles/Dashboard.css'

const Dashboard = () => {
  return (
    <div>
      <Card className='card-container'>
      <i className="pi pi-users" style={{ fontSize: '2.5rem' }}></i>
      <p>CUSTOMERS</p>
      </Card>
    </div>
  )
}

export default Dashboard
