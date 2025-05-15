
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Upload } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await signup(fullName, email, password);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error("Registration failed. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
        <p className="text-muted-foreground mb-8">Join us today by entering your details below.</p>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="absolute bottom-0 right-0 bg-expense-accent text-white rounded-full p-1.5">
              <Upload size={14} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 Characters"
                minLength={8}
                required
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-expense-accent hover:bg-expense-primary text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Creating account...
              </span>
            ) : (
              "SIGN UP"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-expense-accent hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
