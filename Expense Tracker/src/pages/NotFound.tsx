
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-expense-primary mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-expense-accent hover:bg-expense-primary">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
