import { collection, doc, setDoc, getDocs, deleteDoc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../server/firebase';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for random ID generation
import { Account } from '../types/Transactions';
export interface SubCustomer {
  id: string;
  name: string;
  createdOn: string;
}

export interface Customer {
  id: string;
  name: string;
  createdOn: string;
}

// Firestore collection reference
const customersCollection = collection(db, 'Customers');

/**
 * Fetches all customers from Firestore.
 */
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(customersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

/**
 * Adds a new customer with a custom random ID.
 */
export const addCustomer = async (name: string, createdOn: Date = new Date()): Promise<Customer | null> => {
  if (!name.trim()) return null;

  const customId = uuidv4(); // Generate a custom unique ID

  try {
    const docRef = doc(db, 'Customers', customId); // Create document reference with custom ID
    await setDoc(docRef, { id: customId, name, createdOn: createdOn.toISOString() }); // Save document with timestamp
    return { id: customId, name, createdOn: createdOn.toISOString() };
  } catch (error) {
    console.error('Error adding customer:', error);
    return null;
  }
};


/**
 * Deletes a customer from Firestore.
 */
export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'Customers', id));
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

export const getCustomerById = async (customerId: string): Promise<string> => {
    try {
        const docRef = doc(db, 'Customers', customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().name || 'Unknown Customer'; // Ensure fallback if name is missing
        } else {
            console.error('No such customer found!');
            return 'Unknown Customer';
        }
    } catch (error) {
        console.error('Error fetching customer name:', error);
        return 'Unknown Customer';
    }
};

export const getSubCustomerById = async (customerId: string, subCustomerId: string): Promise<string> => {
  try {
      const docRef = doc(db, `Customers/${customerId}/SubCustomers`, subCustomerId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
          return docSnap.data().name || 'Unknown SubCustomer';
      } else {
          console.error('No such subcustomer found!');
          return 'Unknown SubCustomer';
      }
  } catch (error) {
      console.error('Error fetching subcustomer name:', error);
      return 'Unknown SubCustomer';
  }
};


export const getAccountsByCustomerId = async (customerId: string): Promise<Account[]> => {
    try {
        const accountsCollectionRef = collection(db, `Customers/${customerId}/Accounts`);
        const snapshot = await getDocs(accountsCollectionRef);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                credited: data.credited ?? 0,
                debited: data.debited ?? 0,
                dinarPrice: data.dinarPrice ?? 0,
                totalAmount: data.totalAmount ?? 0,
                totalAmountKWD: data.dinarPrice ? (data.totalAmount ?? 0) / data.dinarPrice : 0,
                createdOn: data.createdOn
            };
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
    }
};

export const getSubAccountsByCustomerId = async (customerId: string, subCustomerId: string): Promise<Account[]> => {
  try {
      const accountsCollectionRef = collection(db, `Customers/${customerId}/SubCustomers/${subCustomerId}/Accounts`);
      const snapshot = await getDocs(accountsCollectionRef);

      return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              name: data.name,
              credited: data.credited ?? 0,
              debited: data.debited ?? 0,
              dinarPrice: data.dinarPrice ?? 0,
              totalAmount: data.totalAmount ?? 0,
              totalAmountKWD: data.dinarPrice ? (data.totalAmount ?? 0) / data.dinarPrice : 0,
              createdOn: data.createdOn
          };
      });
  } catch (error) {
      console.error('Error fetching subcustomer accounts:', error);
      return [];
  }
};



export const addAccount = async (
    customerId: string,
    name: string,
    credited: number,
    debited: number,
    dinarPrice: number
): Promise<void> => {
    const id = uuidv4();
    const totalAmount = credited - debited;
    const totalAmountKWD = dinarPrice !== 0 ? totalAmount / dinarPrice : 0;
    const createdOn = new Date().toLocaleDateString()

    try {
        const accountDocRef = doc(db, `Customers/${customerId}/Accounts`, id);
        await setDoc(accountDocRef, {
            id,
            name,
            credited,
            debited,
            dinarPrice,
            totalAmount,
            totalAmountKWD,
            createdOn
        });
        console.log('Account successfully added!');
    } catch (error) {
        console.error('Error adding account:', error);
    }
};

export const addSubAccount = async (
  customerId: string,
  subCustomerId: string,
  name: string,
  credited: number,
  debited: number,
  dinarPrice: number
): Promise<void> => {
  const id = uuidv4();
  const totalAmount = credited - debited;
  const totalAmountKWD = dinarPrice !== 0 ? totalAmount / dinarPrice : 0;
  const createdOn = new Date().toLocaleDateString();

  try {
      const accountDocRef = doc(db, `Customers/${customerId}/SubCustomers/${subCustomerId}/Accounts`, id);
      await setDoc(accountDocRef, {
          id,
          name,
          credited,
          debited,
          dinarPrice,
          totalAmount,
          totalAmountKWD,
          createdOn
      });
      console.log('SubCustomer Account successfully added!');
  } catch (error) {
      console.error('Error adding subcustomer account:', error);
  }
};


export const updateAccount = async (
  customerId: string,
  accountId: string,
  updatedData: Partial<{ name: string; credited: number; debited: number; dinarPrice: number }>
) => {
  const accountRef = doc(db, `Customers/${customerId}/Accounts`, accountId);

  try {
      // Get the existing account data
      const accountSnap = await getDoc(accountRef);
      if (!accountSnap.exists()) {
          console.error('Account does not exist!');
          return;
      }

      const currentData = accountSnap.data();
      
      // Use existing values if fields are not provided in `updatedData`
      const credited = updatedData.credited ?? currentData.credited;
      const debited = updatedData.debited ?? currentData.debited;
      const dinarPrice = updatedData.dinarPrice ?? currentData.dinarPrice;

      // Recalculate total amounts
      const totalAmount = credited - debited;
      const totalAmountKWD = dinarPrice !== 0 ? totalAmount / dinarPrice : 0;

      // Update Firestore with new values
      await updateDoc(accountRef, {
          ...updatedData,
          totalAmount,
          totalAmountKWD,
      });

      console.log('Account successfully updated!');
  } catch (error) {
      console.error('Error updating account:', error);
  }
};


export const updateSubAccount = async (
  customerId: string,
  subCustomerId: string,
  accountId: string,
  updatedData: Partial<{ name: string; credited: number; debited: number; dinarPrice: number }>
) => {
  try {
    const accountRef = doc(db, `Customers/${customerId}/SubCustomers/${subCustomerId}/Accounts`, accountId);

    // Get the existing account data
    const accountSnap = await getDoc(accountRef);
    if (!accountSnap.exists()) {
      console.error('SubCustomer account does not exist!');
      return;
    }

    const currentData = accountSnap.data();

    // Use existing values if fields are not provided in `updatedData`
    const credited = updatedData.credited ?? currentData.credited;
    const debited = updatedData.debited ?? currentData.debited;
    const dinarPrice = updatedData.dinarPrice ?? currentData.dinarPrice;

    // Recalculate total amounts
    const totalAmount = credited - debited;
    const totalAmountKWD = dinarPrice !== 0 ? totalAmount / dinarPrice : 0;

    // Update Firestore with new values
    await updateDoc(accountRef, {
      ...updatedData,
      totalAmount,
      totalAmountKWD,
    });

    console.log('SubCustomer account successfully updated!');
  } catch (error) {
    console.error('Error updating subcustomer account:', error);
  }
};



export const deleteAccount = async (customerId: string, accountId: string): Promise<void> => {
  try {
      const accountRef = doc(db, `Customers/${customerId}/Accounts`, accountId);
      await deleteDoc(accountRef);
      console.log('Account successfully deleted!');
  } catch (error) {
      console.error('Error deleting account:', error);
  }
};

export const deleteSubAccount = async (customerId: string, subCustomerId: string, accountId: string): Promise<void> => {
  try {
      const accountRef = doc(db, `Customers/${customerId}/SubCustomers/${subCustomerId}/Accounts/${accountId}`);
      await deleteDoc(accountRef);
      console.log(`SubCustomer Account ${accountId} deleted successfully`);
  } catch (error) {
      console.error('Error deleting subcustomer account:', error);
      throw error;
  }
};


export const deleteSubCustomer = async (customerId: string, subCustomerId: string): Promise<void> => {
  try {
      await deleteDoc(doc(db, `Customers/${customerId}/SubCustomers`, subCustomerId));
      console.log(`SubCustomer ${subCustomerId} deleted successfully.`);
  } catch (error) {
      console.error('Error deleting subcustomer:', error);
      throw error;
  }
};


// Fetch sub-customers for a given customer
export const getSubCustomers = async (customerId: string): Promise<SubCustomer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, `Customers/${customerId}/SubCustomers`));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubCustomer));
  } catch (error) {
    console.error('Error fetching sub-customers:', error);
    return [];
  }
};

// Add a sub-customer
export const addSubCustomer = async (customerId: string, name: string, createdOn: Date = new Date()): Promise<SubCustomer | null> => {
  if (!name.trim()) return null;

  const subCustomerId = uuidv4();

  try {
    const docRef = doc(db, 'Customers', customerId, 'SubCustomers', subCustomerId);
    await setDoc(docRef, { id: subCustomerId, name, createdOn: createdOn.toISOString() });
    return { id: subCustomerId, name, createdOn: createdOn.toISOString() };
  } catch (error) {
    console.error('Error adding subCustomer:', error);
    return null;
  }
};

export const hasSubCustomers = async (customerId: string) => {
  const subCustomersRef = collection(db, `Customers/${customerId}/SubCustomers`);
  const subCustomersSnapshot = await getDocs(subCustomersRef);
  return !subCustomersSnapshot.empty;
};