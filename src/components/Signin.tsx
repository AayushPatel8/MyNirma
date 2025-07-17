import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth-actions";

const SignIn = () => {
  const handleGoogleLogin = () => {
    console.log("Google login initiated");
    signInWithGoogle();
    // Here you would implement the actual Google authentication logic
    // For now, we'll just log the action
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-300/10 to-blue-300/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main card */}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-md relative z-10">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center text-slate-900">
            Welcome to MyNirma
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Sign in to access your notes and start studying
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md"
            variant="outline"
          >
            <Chrome className="mr-3 h-5 w-5 text-blue-500" />
            <span className="font-medium">Sign in with Google</span>
          </Button>
          
          <div className="text-center pt-4">
            <p className="text-xs text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;