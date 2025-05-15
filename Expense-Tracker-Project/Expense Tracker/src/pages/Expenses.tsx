
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
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Expenses = () => {
  const { transactions, totalExpenses, deleteTransaction } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const currencySymbol = currentUser?.currency === 'INR' ? '₹' : '$';
  
  const transactionsByDate = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
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
    deleteTransaction(id);
    toast.success("Transaction deleted successfully");
    setTransactionToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shopping':
        return <div className="p-2 rounded-full bg-purple-100"><DollarSign className="h-5 w-5 text-purple-500" /></div>;
      case 'travel':
        return <div className="p-2 rounded-full bg-blue-100"><DollarSign className="h-5 w-5 text-blue-500" /></div>;
      case 'utilities':
        return <div className="p-2 rounded-full bg-yellow-100"><DollarSign className="h-5 w-5 text-yellow-500" /></div>;
      case 'groceries':
        return <div className="p-2 rounded-full bg-green-100"><DollarSign className="h-5 w-5 text-green-500" /></div>;
      case 'entertainment':
        return <div className="p-2 rounded-full bg-pink-100"><DollarSign className="h-5 w-5 text-pink-500" /></div>;
      case 'income':
        return <div className="p-2 rounded-full bg-green-100"><TrendingUp className="h-5 w-5 text-green-500" /></div>;
      default:
        return <div className="p-2 rounded-full bg-gray-100"><DollarSign className="h-5 w-5 text-gray-500" /></div>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Expense Overview</h1>
        <Button 
          onClick={() => {
            setSelectedTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="bg-expense-primary hover:bg-expense-secondary"
        >
          <span className="mr-2">+</span> Add Expense
        </Button>
      </div>

      {}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expense Trend</CardTitle>
          <CardDescription>Your spending over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
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
                  stroke="#8884d8" 
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
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>
                Total: {formatCurrency(totalExpenses, currencySymbol)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions
              .filter(t => t.type === 'expense')
              .map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center">
                    {getCategoryIcon(transaction.category)}
                    <div className="ml-4">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="font-medium text-red-500 mr-6">
                      - {formatCurrency(transaction.amount, currencySymbol)}
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
                        onClick={() => setTransactionToDelete(transaction.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            
            {transactions.filter(t => t.type === 'expense').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expenses recorded yet</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedTransaction(null);
                    setIsAddModalOpen(true);
                  }}
                >
                  Add your first expense
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
              {selectedTransaction ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm 
            transactionId={selectedTransaction} 
            onSuccess={() => {
              setIsAddModalOpen(false);
              setSelectedTransaction(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => transactionToDelete && handleDeleteTransaction(transactionToDelete)}
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

export default Expenses;
