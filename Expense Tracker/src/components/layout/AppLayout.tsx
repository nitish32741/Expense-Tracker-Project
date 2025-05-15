
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { SidebarProvider } from "@/components/ui/sidebar";

export function AppLayout() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-expense-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <FinanceProvider>
      <SidebarProvider>
        <div className="flex h-screen bg-background w-full">
          <div className="w-64 hidden md:block">
            <Sidebar />
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {}
            <main className="flex-1 overflow-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FinanceProvider>
  );
}