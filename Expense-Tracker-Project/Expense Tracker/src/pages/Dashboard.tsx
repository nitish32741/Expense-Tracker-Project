import { useState, useEffect } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { PieChart, BarChart2, DollarSign, TrendingUp, TrendingDown, Trash, ChartPieIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart as RechartsEmphasized, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import TransactionForm from "@/components/transactions/TransactionForm";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff6b6b', '#36a2eb', '#ffcd56'];

const Dashboard = () => {
  const { transactions, totalBalance, totalIncome, totalExpenses, deleteTransaction } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);
  const { currentUser } = useAuth();
  
  const recentTransactions = transactions.slice(0, 5);
  
  useEffect(() => {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const { category, amount } = transaction;
        if (!acc[category]) {
          acc[category] = { name: category, value: 0 };
        }
        acc[category].value += amount;
        return acc;
      }, {} as Record<string, { name: string; value: number }>);
    
    setPieData(Object.values(expensesByCategory));
  }, [transactions]);
  const chartConfig = {
    shopping: { color: '#8884d8' },
    travel: { color: '#82ca9d' },
    utilities: { color: '#ffc658' },
    groceries: { color: '#ff8042' },
    entertainment: { color: '#ff6b6b' },
    other: { color: '#36a2eb' },
  };

  const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case 'USD': return '$';
      case 'INR': return '₹';
      default: return '$';
    }
  };
  
  const currencySymbol = getCurrencySymbol(currentUser?.currency || 'USD');

  const handleDeleteTransaction = (id: string) => {
    console.log("Dashboard: Delete transaction triggered for ID:", id);
    deleteTransaction(id);
    setTransactionToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-expense-primary hover:bg-expense-secondary"
        >
          <span className="mr-2">+</span> Add Expense
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100 mr-4">
                <DollarSign className="h-6 w-6 text-expense-primary" />
              </div>
              <div>
                <CardDescription>Total Balance</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(totalBalance, currencySymbol)}
                </CardTitle>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100 mr-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardDescription>Total Income</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(totalIncome, currencySymbol)}
                </CardTitle>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100 mr-4">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(totalExpenses, currencySymbol)}
                </CardTitle>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest 5 transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/expenses">View all</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id} 
                    transaction={transaction}
                    currencySymbol={currencySymbol}
                    onDelete={() => setTransactionToDelete(transaction.id)}
                  />
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ChartContainer className="w-full h-[300px]" config={chartConfig}>
                <RechartsEmphasized>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number, currencySymbol)}
                      />
                    }
                  />
                </RechartsEmphasized>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <ChartPieIcon className="h-12 w-12 mb-2" />
                <p>No expense data to display</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm onSuccess={() => setIsAddModalOpen(false)} />
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
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (transactionToDelete) {
                  console.log("Dashboard: Confirming delete for transaction:", transactionToDelete);
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

interface TransactionItemProps {
  transaction: Transaction;
  currencySymbol: string;
  onDelete: () => void;
}

const TransactionItem = ({ transaction, currencySymbol, onDelete }: TransactionItemProps) => {
  
  const getIcon = (category: string) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {getIcon(transaction.category)}
        <div className="ml-4">
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`font-medium ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
          {transaction.type === 'expense' ? '- ' : '+ '}
          {formatCurrency(transaction.amount, currencySymbol)}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="h-8 w-8"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
