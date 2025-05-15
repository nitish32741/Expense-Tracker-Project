
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

export type Category = 
  | 'shopping'
  | 'travel'
  | 'utilities'
  | 'groceries'
  | 'entertainment'
  | 'other'
  | 'income';

export type Transaction = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  date: string;
  category: Category;
  description: string;
};

type FinanceContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => void;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  isLoading: boolean;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}


const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 430,
    date: '2025-05-17',
    category: 'shopping',
    description: 'Shopping',
  },
  {
    id: '2',
    type: 'expense',
    amount: 670,
    date: '2025-05-13',
    category: 'travel',
    description: 'Travel',
  },
  {
    id: '3',
    type: 'expense',
    amount: 200,
    date: '2025-05-11',
    category: 'utilities',
    description: 'Electricity Bill',
  },
  {
    id: '4',
    type: 'expense',
    amount: 600,
    date: '2025-05-10',
    category: 'other',
    description: 'Loan Repayment',
  },
  {
    id: '5',
    type: 'expense',
    amount: 150,
    date: '2025-05-08',
    category: 'groceries',
    description: 'Groceries',
  },
  {
    id: '6',
    type: 'expense',
    amount: 50,
    date: '2025-05-06',
    category: 'entertainment',
    description: 'Movie Night',
  },
  {
    id: '7',
    type: 'income',
    amount: 2500,
    date: '2025-05-01',
    category: 'income',
    description: 'Salary',
  },
];

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions(SAMPLE_TRANSACTIONS);
      localStorage.setItem('transactions', JSON.stringify(SAMPLE_TRANSACTIONS));
    }
    setIsLoading(false);
  }, []);

  const saveTransactions = (newTransactions: Transaction[]) => {
    localStorage.setItem('transactions', JSON.stringify(newTransactions));
    return newTransactions;
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prevTransactions => 
      saveTransactions([newTransaction, ...prevTransactions])
    );
    toast({
      title: "Success",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} added successfully`,
    });
  };

  const deleteTransaction = (id: string) => {
    console.log("Attempting to delete transaction:", id);
    const transactionToDelete = transactions.find(t => t.id === id);
   if (!transactionToDelete) {
      console.log("Transaction not found:", id);
      return;
    }
    console.log("Found transaction to delete:", transactionToDelete);
    
    setTransactions(prevTransactions => {
      const updatedTransactions = prevTransactions.filter(t => t.id !== id);
      console.log("Transactions after deletion:", updatedTransactions);
      return saveTransactions(updatedTransactions);
    });
    
    
      toast({
        title: "Success",
        description: `${transactionToDelete.type === 'income' ? 'Income' : 'Expense'} deleted successfully`,
      });
    
  };

  const editTransaction = (
    id: string, 
    transaction: Partial<Omit<Transaction, 'id'>>
  ) => {
    setTransactions(prevTransactions => 
      saveTransactions(prevTransactions.map(t => 
        t.id === id ? { ...t, ...transaction } : t
      ))
    );
    toast({
      title: "Success",
      description: "Transaction updated successfully",
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  const value = {
    transactions,
    addTransaction,
    deleteTransaction,
    editTransaction,
    totalBalance,
    totalIncome,
    totalExpenses,
    isLoading,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
