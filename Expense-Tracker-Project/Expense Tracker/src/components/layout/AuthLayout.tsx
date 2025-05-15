
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BarChart2 } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-expense-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {}
      <div className="flex flex-col w-full lg:w-1/2 p-8 justify-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-expense-primary">Expense Tracker</h1>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
      
      {}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-expense-primary via-expense-secondary to-expense-accent items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl p-12 text-center">
          <div className="inline-flex p-4 mb-6 rounded-full bg-white/10 backdrop-blur-md">
            <BarChart2 size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Track Your Income & Expenses
          </h2>
          <p className="text-4xl font-bold text-white">$430,000</p>
          
          <div className="absolute bottom-12 right-12 p-6 bg-white/10 backdrop-blur-md rounded-xl text-left">
            <h3 className="font-medium text-white mb-2">All Transactions</h3>
            <p className="text-sm text-white/70 mb-6">2nd Jan to 21th Dec</p>
            
            <div className="w-[400px] h-[200px] bg-white/5 rounded-lg">
              {}
              <div className="flex items-end justify-between h-full p-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center w-8">
                    <div className="w-full bg-white/20 rounded-t-sm" 
                      style={{ height: `${30 + Math.random() * 100}px` }}></div>
                    <div className="text-xs text-white/80 mt-2">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/20"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>
  );
}
