import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Messages } from 'primereact/messages';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { getSubCustomers, addSubCustomer, deleteSubCustomer } from '../services/CustomersService';
import { SubCustomer } from '../services/CustomersService';

import '../styles/SubCustomers.css';

const SubCustomers = () => {
    const { customerId } = useParams();
    const [subCustomers, setSubCustomers] = useState<SubCustomer[]>([]);
    const [filteredSubCustomers, setFilteredSubCustomers] = useState<SubCustomer[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [subCustomerName, setSubCustomerName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const msg = React.useRef<Messages>(null);
    const navigate = useNavigate();

    const fetchSubCustomers = async () => {
        if (customerId) {
            const data = await getSubCustomers(customerId);
            setSubCustomers(data);
            setFilteredSubCustomers(data);
        }
    };

    useEffect(() => {
        fetchSubCustomers();
    }, [customerId]);

    useEffect(() => {
        setFilteredSubCustomers(
            subCustomers.filter(subCustomer =>
                subCustomer.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, subCustomers]);

    const handleAddSubCustomer = async () => {
        if (!subCustomerName.trim()) {
            msg.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Name cannot be empty' });
            return;
        }

        setLoading(true);
        const newSubCustomer = await addSubCustomer(customerId!, subCustomerName, new Date());
        setLoading(false);

        if (newSubCustomer) {
            setSubCustomers([...subCustomers, newSubCustomer]);
            setShowDialog(false);
            setSubCustomerName('');
            msg.current?.show({ severity: 'success', summary: 'Success', detail: 'SubCustomer added successfully' });
        } else {
            msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to add subCustomer' });
        }
    };

    const handleDelete = async (subCustomerId: string) => {
        if (!customerId || !subCustomerId) return;

        try {
            await deleteSubCustomer(customerId, subCustomerId);
            fetchSubCustomers(); // Refresh the list after deletion
            msg.current?.show({ severity: 'success', summary: 'Success', detail: 'SubCustomer deleted successfully' });
        } catch (error) {
            console.error('Error deleting subcustomer:', error);
            msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete subcustomer' });
        }
    };

    const confirmDelete = (subCustomerId: string) => {
        confirmDialog({
            message: 'Are you sure you want to delete this subcustomer?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => handleDelete(subCustomerId),
        });
    };

    return (
        <div className="subcustomers-container">
            <Messages ref={msg} className="small-messages" />
            <ConfirmDialog />

            {/* Buttons and Title */}
            <div className="btn-container">
                <Button icon="pi pi-arrow-left" className="p-button-success" onClick={() => navigate('/customers')} />
                <h5 className="subcustomers-header hide-on-mobile">SubCustomers</h5>
                <Button label="Add SubCustomer" icon="pi pi-user-plus" onClick={() => setShowDialog(true)} className="p-button-success" />
            </div>

            {/* Search Bar */}
            <div className="p-inputgroup mb-3 search-bar">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-search"></i>
                </span>
                <InputText
                    placeholder="Search Sub Customers"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* DataTable */}
            <DataTable value={filteredSubCustomers} className="subcustomers-table">
                <Column
                    field="name"
                    header="Name"
                    body={(rowData) => (
                        <span
                            style={{ textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => navigate(`/accounts/${customerId}/${rowData.id}`)}
                        >
                            {rowData.name}
                        </span>
                    )}
                />
                <Column field="createdOn" header="Created On" body={(rowData) => new Date(rowData.createdOn).toLocaleDateString()} />
                <Column
                    header="Actions"
                    body={(rowData) => (
                        <Button
                            icon="pi pi-trash"
                            text
                            className="p-button-danger"
                            onClick={() => confirmDelete(rowData.id)}
                        />
                    )}
                />
            </DataTable>

            {/* Dialog for Adding SubCustomer */}
            <Dialog visible={showDialog} onHide={() => setShowDialog(false)} header="Create SubCustomer">
                <InputText
                    placeholder="Enter SubCustomer Name"
                    value={subCustomerName}
                    onChange={(e) => setSubCustomerName(e.target.value)}
                />
                <div className="dialog-buttons">
                    <Button
                        label="Cancel"
                        text
                        severity="secondary"
                        onClick={() => setShowDialog(false)}
                        disabled={loading}
                    />
                    <Button
                        label="Save"
                        text
                        severity="success"
                        onClick={handleAddSubCustomer}
                        disabled={loading}
                    />
                </div>
            </Dialog>
        </div>

    );
};

export default SubCustomers;
