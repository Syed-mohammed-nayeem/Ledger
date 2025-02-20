import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../server/firebase';

export interface AdminAccount {
  id?: string;
  amount: number;
  date: Timestamp;
}

const adminCollection = collection(db, 'AdminAccount');

export const addAdminAccount = async (amount: number) => {
  await addDoc(adminCollection, {
    amount,
    date: Timestamp.now(),
  });
};

export const getAdminAccounts = async (): Promise<AdminAccount[]> => {
  const snapshot = await getDocs(adminCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminAccount));
};

export const updateAdminAccount = async (id: string, amount: number) => {
  const docRef = doc(db, 'AdminAccount', id);
  await updateDoc(docRef, { amount });
};

export const deleteAdminAccount = async (id: string) => {
  const docRef = doc(db, 'AdminAccount', id);
  await deleteDoc(docRef);
};
