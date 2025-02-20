import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Calendar } from 'primereact/calendar';
import { getAccountsByCustomerId, getCustomerById, deleteAccount, getSubAccountsByCustomerId, getSubCustomerById, deleteSubAccount } from '../services/CustomersService';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import AddCustomerAmount from './AddCustomerAmount';
import { Account } from '../types/Transactions';

import '../styles/CustomerAccounts.css';
import { Messages } from 'primereact/messages';

const CustomerAccounts: React.FC = () => {
    const msg = React.useRef<Messages>(null);
    const { customerId, subCustomerId } = useParams();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [view, setView] = useState('tableView');
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
    const [selectedSubCustomerName, setSelectedSubCustomerName] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const navigate = useNavigate();

    const refreshAccounts = () => {
        if (customerId) {
            setLoading(true);

            const fetchData = subCustomerId
                ? getSubAccountsByCustomerId(customerId, subCustomerId)
                : getAccountsByCustomerId(customerId);

            fetchData
                .then((data) => {
                    setAccounts(data);
                    setFilteredAccounts(data); // Initially, no filtering applied
                })
                .catch((error) => console.error('Error fetching accounts:', error))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        if (customerId) {
            setLoading(true);

            if (subCustomerId) {
                getSubCustomerById(customerId, subCustomerId)
                    .then(setSelectedSubCustomerName)
                    .catch((error) => console.error('Error fetching subcustomer name:', error));
            } else {
                getCustomerById(customerId)
                    .then(setSelectedCustomerName)
                    .catch((error) => console.error('Error fetching customer name:', error));
            }

            refreshAccounts();
        }
    }, [customerId, subCustomerId]);

    useEffect(() => {
        if (selectedDate) {
            const filtered = accounts.filter(account =>
                account.createdOn && new Date(account.createdOn).toDateString() === selectedDate.toDateString()
            );
            setFilteredAccounts(filtered);
        } else {
            setFilteredAccounts(accounts);
        }
    }, [selectedDate, accounts]);

    const confirmDelete = (accountId: string) => {
        confirmDialog({
            message: 'Are you sure you want to delete this account?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => handleDelete(accountId),
        });
    };

    const handleDelete = async (accountId: string) => {
        if (!customerId) return;

        try {
            if (subCustomerId) {
                // Delete from SubCustomer's account
                await deleteSubAccount(customerId, subCustomerId, accountId);
            } else {
                // Delete from Customer's account
                await deleteAccount(customerId, accountId);
            }

            refreshAccounts(); // Refresh account list after deletion
            msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Account deleted successfully' });
        } catch (error) {
            console.error('Error deleting account:', error);
            msg.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete account' });
        }
    };

    const totalCredit = filteredAccounts.reduce((sum, acc) => sum + (acc.credited || 0), 0);
    const totalDebit = filteredAccounts.reduce((sum, acc) => sum + (acc.debited || 0), 0);
    const netTotal = totalCredit - totalDebit;

    return (
        <div>
            <Messages ref={msg} className="small-messages" />
            <ConfirmDialog />
            {loading ? (
                <ProgressSpinner />
            ) : view === 'tableView' ? (
                <div>
                    <div className="p-grid">
                        {/* Back and Add Amount Buttons in a single line */}
                        <div className="p-col-12">
                            <div className="back-add-btn">
                                <Button
                                    severity="success"
                                    icon="pi pi-angle-left"
                                    onClick={() => navigate(subCustomerId ? `/subcustomers/${customerId}` : '/customers')}
                                    className="m-2" // Margin added to the button
                                />
                                <Button
                                    severity="success"
                                    label="Add Amount"
                                    icon="pi pi-plus"
                                    onClick={() => { setSelectedAccount(null); setView('addView'); }}
                                    className="m-2" // Margin added to the button
                                />
                            </div>
                        </div>

                        {/* Calendar and Clear button in second line */}
                        <div className="p-col-12">
                            <div className="calendar-clear-flex">
                                <Calendar
                                    id="date-filter"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.value as Date)}
                                    showIcon
                                    className="m-2" // Margin added to the calendar
                                />
                                {/* Show Clear button only if a date is selected */}
                                {selectedDate && (
                                    <Button
                                        label="Clear"
                                        icon="pi pi-times"
                                        severity="danger"
                                        onClick={() => setSelectedDate(null)}
                                        className="m-2" // Margin added to the button
                                    />
                                )}
                            </div>
                        </div>

                        {/* Net Total below Calendar and Clear button */}
                        <div className="p-col-12">
                            <h3 className="align">
                                Net Total: <span className={`${netTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>{netTotal}</span>
                            </h3>
                        </div>
                    </div>

                    <DataTable value={filteredAccounts}>
                        <Column field="createdOn" header="Date" />
                        <Column field="name" header="Name" />
                        <Column field="credited" header="Credit" />
                        <Column field="debited" header="Debit" />
                        <Column field="dinarPrice" header="Dinar Price" />
                        <Column field="totalAmount" header="Amount (rs)" />
                        <Column field="totalAmountKWD" header="Amount (KWD)" />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className="flex gap-2">
                                    <Button
                                        severity="secondary" text
                                        icon="pi pi-pencil"
                                        onClick={() => {
                                            setSelectedAccount(rowData);
                                            setView('editView');
                                        }}
                                        className="m-2" // Margin added to the button
                                    />
                                    <Button
                                        severity="danger"
                                        icon="pi pi-trash"
                                        text
                                        onClick={() => confirmDelete(rowData.id)}
                                        className="m-2" // Margin added to the button
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                </div>
            ) : (
                <AddCustomerAmount
                    setView={setView}
                    customerId={customerId || ''}
                    customerName={selectedCustomerName}
                    refreshAccounts={refreshAccounts}
                    account={selectedAccount || undefined}
                    subCustomerId={subCustomerId || ''}
                    subCustomerName={selectedSubCustomerName}
                />
            )}
        </div>
    );
};

export default CustomerAccounts;
