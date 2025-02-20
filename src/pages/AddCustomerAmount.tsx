import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Messages } from 'primereact/messages';
import { addAccount, addSubAccount, updateAccount, updateSubAccount } from '../services/CustomersService';
import { Account } from '../types/Transactions';

import '../styles/Input.css';

interface Props {
    setView: (view: string) => void;
    customerId: string;
    customerName: string;
    refreshAccounts: () => void;
    account?: Account; // Optional for editing
    subCustomerId?: string;
    subCustomerName?: string
}

const AddCustomerAmount: React.FC<Props> = ({ setView, customerId, customerName, refreshAccounts, account, subCustomerId, subCustomerName }) => {
    const [credit, setCredit] = useState(0);
    const [debit, setDebit] = useState(0);
    const [dinarPrice, setDinarPrice] = useState(0);
    const msg = useRef<Messages>(null);
    const [name, setName] = useState(subCustomerName || customerName || '');

    useEffect(() => {
        if (account) {
            // If editing, set existing account data
            setName(account.name || subCustomerName || customerName || '');
            setCredit(account.credited || 0);
            setDebit(account.debited || 0);
            setDinarPrice(account.dinarPrice || 0);
        } else {
            // Set the correct name for a new entry
            setName(subCustomerName || customerName || '');
            setCredit(0);
            setDebit(0);
            setDinarPrice(0);
        }
    }, [account, subCustomerName, customerName]);

    const handleSave = async () => {
        if (!customerId || !name || dinarPrice === 0) {
            msg.current?.clear();
            msg.current?.show({ severity: 'warn', summary: 'Validation Error', detail: 'Please enter valid data.' });
            return;
        }

        msg.current?.clear();

        if (account) {
            // Update existing account
            if (subCustomerId) {
                await updateSubAccount(customerId, subCustomerId, account.id, { name, credited: credit, debited: debit, dinarPrice });
            } else {
                await updateAccount(customerId, account.id, { name, credited: credit, debited: debit, dinarPrice });
            }
            msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Amount updated successfully!' });
        } else {
            // Add new account
            if (subCustomerId) {
                await addSubAccount(customerId, subCustomerId, name, credit, debit, dinarPrice);
            } else {
                await addAccount(customerId, name, credit, debit, dinarPrice);
            }
            msg.current?.show({ severity: 'success', summary: 'Success', detail: 'Amount added successfully!' });
        }

        setCredit(0);
        setDebit(0);
        setDinarPrice(0);

        refreshAccounts();
        setTimeout(() => setView('tableView'), 500);
    };



    return (
        <div className="input-container">
            <Messages ref={msg} />

            <div>
                <label htmlFor="name">Name</label>
                <InputText id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly />

                <label htmlFor="credit">Credit Amount</label>
                <InputNumber id="credit" value={credit} onValueChange={(e) => setCredit(e.value || 0)} />

                <label htmlFor="debit">Debit Amount</label>
                <InputNumber id="debit" value={debit} onValueChange={(e) => setDebit(e.value || 0)} />

                <label htmlFor="dinarPrice">Dinar Price</label>
                <InputNumber id="dinarPrice" mode="decimal" value={dinarPrice} onValueChange={(e) => setDinarPrice(e.value || 0)} minFractionDigits={2}
                    maxFractionDigits={4}
                />
            </div>
            <div className="flex-btn">
                <Button severity="danger" icon="pi pi-arrow-left" label="Back" onClick={() => setView('tableView')} />
                <Button severity="success" label={account ? 'Update' : 'Save'} onClick={handleSave} />
            </div>
        </div>
    );
};

export default AddCustomerAmount;
