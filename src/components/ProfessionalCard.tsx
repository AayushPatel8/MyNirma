import { ReactNode } from "react";

const Card = ({ children, className = "" }:{children: ReactNode; className?: string}) => (
  <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", size = "default", ...props }:{ 
  children: ReactNode; 
  className?: string; 
  size?: "sm" | "default" | "lg";
  [key: string]: any; 
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button 
      className={`rounded-md font-medium transition-all duration-200 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function ProfessionalImageCard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
      <Card className="max-w-4xl w-full transform hover:scale-105 transition-transform duration-300">
        <div className="relative h-80 group">
          {/* Image with overlay gradient */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQjvh-QAEGJmhutan48qXeGJ6B0jHxZMaTBQ&s')"
            }}
          />
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <Button 
              size="default" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg backdrop-blur-sm border border-white/20 font-semibold self-start group-hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}