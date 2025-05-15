
import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { PieChart as PieChartIcon, BarChart2 } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const { transactions } = useFinance();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("category");
  
  const currencySymbol = currentUser?.currency === 'INR' ? '₹' : '$';
  
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value += amount;
      return acc;
    }, {} as Record<string, { name: string; value: number }>);
  
  const pieData = Object.values(expenseByCategory);
  
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = { 
        month: MONTHS[month],
        income: 0,
        expense: 0
      };
    }
    
    if (transaction.type === 'income') {
      acc[key].income += transaction.amount;
    } else {
      acc[key].expense += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);
  
  const barData = Object.entries(monthlyData)
    .sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      return yearA === yearB ? monthA - monthB : yearA - yearB;
    })
    .slice(-6)
    .map(([_, data]) => data);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
      </div>

      <Tabs defaultValue="category" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="category">
            <div className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" />
              Expenses by Category
            </div>
          </TabsTrigger>
          <TabsTrigger value="monthly">
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" />
              Monthly Comparison
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution by Category</CardTitle>
              <CardDescription>
                Breakdown of your expenses across different categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {pieData.length > 0 ? (
                <ChartContainer
                  className="h-full w-full"
                  config={{
                    shopping: { theme: { light: "#8884d8", dark: "#8884d8" } },
                    travel: { theme: { light: "#82ca9d", dark: "#82ca9d" } },
                    utilities: { theme: { light: "#ffc658", dark: "#ffc658" } },
                    groceries: { theme: { light: "#ff8042", dark: "#ff8042" } },
                    entertainment: { theme: { light: "#0088FE", dark: "#0088FE" } },
                    other: { theme: { light: "#00C49F", dark: "#00C49F" } },
                  }}
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      innerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number, currencySymbol)} />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <PieChartIcon className="h-12 w-12 mb-2" />
                  <p>No expense data to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income & Expense Comparison</CardTitle>
              <CardDescription>
                Track your financial flow over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {barData.length > 0 ? (
                <ChartContainer
                  className="h-full w-full"
                  config={{
                    income: { theme: { light: "#82ca9d", dark: "#82ca9d" } },
                    expense: { theme: { light: "#8884d8", dark: "#8884d8" } },
                  }}
                >
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number, currencySymbol)} />} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#82ca9d" />
                    <Bar dataKey="expense" name="Expense" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BarChart2 className="h-12 w-12 mb-2" />
                  <p>No transaction data to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
