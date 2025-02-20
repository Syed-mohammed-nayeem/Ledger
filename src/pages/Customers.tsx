import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Messages } from 'primereact/messages';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Customer, getCustomers, hasSubCustomers, deleteCustomer, addCustomer, addSubCustomer } from '../services/CustomersService';
import '../styles/Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [showSubCustomerDialog, setShowSubCustomerDialog] = useState(false);
  const [subCustomerName, setSubCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loadingSubCustomer, setLoadingSubCustomer] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const msg = useRef<Messages>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCustomers().then((data) => {
      setCustomers(data);
      setFilteredCustomers(data);
    });
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const confirmDelete = (id: string) => {
    confirmDialog({
      message: 'Are you sure you want to delete this customer?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      accept: () => handleDelete(id),
    });
  };

  const handleDelete = async (id: string) => {
    setLoadingDelete(id);
    const isDeleted = await deleteCustomer(id);
    setLoadingDelete(null);

    if (isDeleted) {
      setCustomers(customers.filter((customer) => customer.id !== id));
      msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Customer deleted successfully' });
    } else {
      msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete customer' });
    }
  };

  const handleNavigate = async (customerId: string) => {
    const hasSubs = await hasSubCustomers(customerId);
    if (hasSubs) {
      navigate(`/subcustomers/${customerId}`);
    } else {
      navigate(`/accounts/${customerId}`);
    }
  };

  const handleAddCustomer = async () => {
    if (!customerName.trim()) return;
    setLoadingCustomer(true);
    const newCustomer = await addCustomer(customerName);
    setLoadingCustomer(false);
    setShowAddCustomerDialog(false);
    setCustomerName('');

    if (newCustomer) {
      setCustomers([...customers, newCustomer]);
      msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Customer added successfully' });
    } else {
      msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add customer' });
    }
  };

  const handleAddSubCustomer = async () => {
    if (!selectedCustomerId || !subCustomerName.trim()) return;
    setLoadingSubCustomer(true);
    const success = await addSubCustomer(selectedCustomerId, subCustomerName);
    setLoadingSubCustomer(false);
    setShowSubCustomerDialog(false);
    setSubCustomerName('');
    if (success) {
      msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Subcustomer added successfully' });
    } else {
      msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add subcustomer' });
    }
  };

  return (
    <div className="container">
      <ConfirmDialog />
      <Messages ref={msg} className="small-messages" />

      <div className="customers-header">
        <h5>Customers</h5>
        <Button
          label="Add Customer"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => setShowAddCustomerDialog(true)}
        />
      </div>

      <div className="search-container">
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className="pi pi-search"></i>
          </span>
          <InputText
            placeholder="Search Customers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable value={filteredCustomers} emptyMessage="No customers found" responsiveLayout="scroll">
        <Column field="name" header="Name" body={(rowData) => (
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }} className="customer-id-link" onClick={() => handleNavigate(rowData.id)}>
            {rowData.name}
          </span>
        )} />
        <Column field="createdOn" header="Created On" body={(rowData) => new Date(rowData.createdOn).toLocaleDateString()} />
        <Column header="Actions" body={(rowData) => (
          <div className="table-actions">
            <Button icon="pi pi-users" text className="p-button-primary" onClick={() => { setSelectedCustomerId(rowData.id); setShowSubCustomerDialog(true); }} tooltip="Create Sub User" />
            <Button icon="pi pi-trash" text className="p-button-danger" onClick={() => confirmDelete(rowData.id)} disabled={loadingDelete === rowData.id} />
          </div>
        )} />
      </DataTable>

      <Dialog visible={showAddCustomerDialog} onHide={() => setShowAddCustomerDialog(false)} header="Add Customer">
        <InputText value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter Customer Name" />
        <div className="dialog-buttons">
          <Button label="Cancel" text severity="secondary" onClick={() => setShowAddCustomerDialog(false)} disabled={loadingCustomer} />
          <Button label="Save" text severity="success" onClick={handleAddCustomer} disabled={loadingCustomer} />
        </div>
      </Dialog>

      <Dialog visible={showSubCustomerDialog} onHide={() => setShowSubCustomerDialog(false)} header="Add Subcustomer">
        <InputText value={subCustomerName} onChange={(e) => setSubCustomerName(e.target.value)} placeholder="Enter Subcustomer Name" />
        <div className="dialog-buttons">
          <Button label="Cancel" text severity="secondary" onClick={() => setShowSubCustomerDialog(false)} disabled={loadingSubCustomer} />
          <Button label="Save" text severity="success" onClick={handleAddSubCustomer} disabled={loadingSubCustomer} />
        </div>
      </Dialog>
    </div>
  );
};

export default Customers;
