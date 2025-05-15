
import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Edit, Trash, DollarSign, TrendingUp } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Income = () => {
  const { transactions, totalIncome, deleteTransaction } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  const currencySymbol = currentUser?.currency === 'INR' ? '₹' : '$';
  
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  const transactionsByDate = incomeTransactions.reduce((acc, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += transaction.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(transactionsByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-15)
    .map(([date, amount]) => {
      const d = new Date(date);
      return {
        date: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`,
        amount
      };
    });
  
  const handleDeleteTransaction = (id: string) => {
     console.log("Delete transaction triggered for ID:", id);
    deleteTransaction(id);
    setTransactionToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income':
        return <div className="p-2 rounded-full bg-green-100"><TrendingUp className="h-5 w-5 text-green-500" /></div>;
      default:
        return <div className="p-2 rounded-full bg-green-100"><DollarSign className="h-5 w-5 text-green-500" /></div>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Income Overview</h1>
        <Button 
          onClick={() => {
            setSelectedTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <span className="mr-2">+</span> Add Income
        </Button>
      </div>

      {}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Income Trend</CardTitle>
          <CardDescription>Your income over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                />
                <YAxis hide />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number, currencySymbol)} 
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Income</CardTitle>
              <CardDescription>
                Total: {formatCurrency(totalIncome, currencySymbol)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                       {incomeTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">
                    {getCategoryIcon(transaction.category)}
                    <div className="ml-4">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="font-medium text-green-500 mr-6">
                      + {formatCurrency(transaction.amount, currencySymbol)}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTransaction(transaction.id);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                         onClick={() => {
                          console.log("Setting transaction to delete:", transaction.id);
                          setTransactionToDelete(transaction.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            
            {incomeTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No income recorded yet</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedTransaction(null);
                    setIsAddModalOpen(true);
                  }}
                >
                  Add your first income
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction ? "Edit Transaction" : "Add New Income"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm 
            transactionId={selectedTransaction} 
            defaultType="income"
            onSuccess={() => {
              setIsAddModalOpen(false);
              setSelectedTransaction(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => {
        if (!open) setTransactionToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this income record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (transactionToDelete) {
                  console.log("Confirming delete for transaction:", transactionToDelete);
                  handleDeleteTransaction(transactionToDelete);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Income;
