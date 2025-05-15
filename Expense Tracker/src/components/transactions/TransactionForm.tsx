
import { useState, useEffect } from "react";
import { useFinance, Transaction } from "@/context/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  transactionId?: string | null;
  defaultType?: "expense" | "income";
  onSuccess: () => void;
}

const TransactionForm = ({ transactionId, defaultType = "expense", onSuccess }: TransactionFormProps) => {
  const { transactions, addTransaction, editTransaction } = useFinance();
  
  const [type, setType] = useState<"expense" | "income">(defaultType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Transaction['category']>("shopping");
  const [date, setDate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (transactionId) {
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDescription(transaction.description);
        setCategory(transaction.category);
        setDate(new Date(transaction.date));
      }
    }
  }, [transactionId, transactions]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const transactionData = {
      type,
      amount: parsedAmount,
      description,
      category,
      date: date.toISOString().split('T')[0],
    };
    
    try {
      if (transactionId) {
        editTransaction(transactionId, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        addTransaction(transactionData);
        toast.success("Transaction added successfully");
      }
      
      onSuccess();
      
     
      if (!transactionId) {
        setAmount("");
        setDescription("");
        setCategory("shopping");
        setDate(new Date());
      }
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label>Transaction Type</Label>
        <RadioGroup 
          value={type} 
          onValueChange={(value) => setType(value as "expense" | "income")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="cursor-pointer">Expense</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="cursor-pointer">Income</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="flex space-x-4">
        <div className="space-y-2 flex-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-2 flex-1">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Transaction description"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as Transaction['category'])}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {type === "expense" ? (
              <>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-expense-accent hover:bg-expense-primary"
        >
          {transactionId ? "Update" : "Add"} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
