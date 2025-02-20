import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Messages } from 'primereact/messages';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog'; // Import Dialog component
import { InputNumber } from 'primereact/inputnumber';
import { addAdminAccount, getAdminAccounts, updateAdminAccount, deleteAdminAccount, AdminAccount } from '../services/AdminAccountsService';

import '../styles/Admin.css';

interface AdminAccountDisplay {
  id?: string;
  amount: number;
  date: string;
}

const Admin = () => {
  const [view, setView] = useState<'buttonView' | 'addView' | 'editView'>('buttonView');
  const [amount, setAmount] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccountDisplay[]>([]);
  const [displayDialog, setDisplayDialog] = useState(false); // Dialog visibility state
  const msg = useRef<Messages>(null);

  useEffect(() => {
    fetchAdminAccounts();
  }, []);

  const fetchAdminAccounts = async () => {
    try {
      const accounts = await getAdminAccounts();
      const formattedAccounts: AdminAccountDisplay[] = accounts.map(account => ({
        id: account.id,
        amount: account.amount,
        date: account.date.toDate().toLocaleDateString(),
      }));
      setAdminAccounts(formattedAccounts);
    } catch (error) {
      console.error('Error fetching Admin Accounts:', error);
    }
  };

  const handleSave = async () => {
    if (!amount || amount <= 0) {
      msg.current?.clear();
      msg.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter a valid amount.' });
      return;
    }

    try {
      if (editingId) {
        await updateAdminAccount(editingId, amount);
        msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Amount updated successfully!' });
      } else {
        await addAdminAccount(amount);
        msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Amount added successfully!' });
      }
      setView('buttonView');
      setAmount(null);
      setEditingId(null);
      fetchAdminAccounts();
      setDisplayDialog(false); // Close dialog after save
    } catch (error) {
      msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save amount.' });
      console.error('Error saving Admin Account:', error);
    }
  };

  const confirmDelete = (id: string) => {
    confirmDialog({
      message: 'Are you sure you want to delete this amount?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary',
      accept: () => handleDelete(id),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminAccount(id);
      msg.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Amount deleted successfully!' });
      fetchAdminAccounts();
    } catch (error) {
      msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete amount.' });
      console.error('Error deleting Admin Account:', error);
    }
  };

  const totalAmount = adminAccounts.reduce((sum, account) => sum + account.amount, 0);

  return (
    <div className="p-grid p-nogutter">
      <ConfirmDialog />
      <Messages ref={msg} />

      <div className="p-d-flex p-jc-between p-ai-center" style={{ width: '100%' }}>
        <h3>Net Total: {totalAmount.toFixed(2)}</h3>
        <Button
          severity="success"
          icon="pi pi-plus"
          label="Add Amount"
          onClick={() => setDisplayDialog(true)}
        />
      </div>

      <Dialog
        visible={displayDialog}
        onHide={() => setDisplayDialog(false)}
        header={editingId ? 'Edit Amount' : 'Add Amount'}
        footer={
          <div className="dialog-buttons">
            <Button severity='secondary' label="Cancel" text onClick={() => setDisplayDialog(false)} className="p-button-text" />
            <Button severity='success' label={editingId ? 'Update' : 'Add'} text onClick={handleSave} />
          </div>
        }
      >
        <div className="p-field">
          <InputNumber
            id="amount"
            value={amount}
            onValueChange={(e) => setAmount(e.value || null)}
            min={0}
            placeholder="Enter amount"
          />
        </div>
      </Dialog>


      {/* DataTable Section */}
      <DataTable value={adminAccounts} responsiveLayout="scroll">
        <Column field="date" header="Date" />
        <Column field="amount" header="Amount" />
        <Column
          header="Actions"
          body={(rowData) => (
            <div className="p-d-flex p-gap-2">
              <Button
                severity="secondary"
                icon="pi pi-pencil"
                text
                onClick={() => {
                  setEditingId(rowData.id);
                  setAmount(rowData.amount);
                  setView('editView');
                  setDisplayDialog(true); // Open the dialog for editing
                }}
              />
              <Button
                severity="danger"
                icon="pi pi-trash"
                text
                onClick={() => confirmDelete(rowData.id!)} // Show confirmation before deleting
              />
            </div>
          )}
        />
      </DataTable>
    </div>
  );
};

export default Admin;
