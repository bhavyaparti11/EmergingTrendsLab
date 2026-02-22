import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { Loader2 } from "lucide-react";

// Pages
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Pantry from "./pages/Pantry";
import Family from "./pages/Family";
import MealPlanner from "./pages/MealPlanner";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  // If user passed from AuthCallback, allow access
  if (location.state?.user) {
    return children;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Router with session_id detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment (not query params) for session_id - detect DURING render, not in useEffect
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/pantry" element={
        <ProtectedRoute>
          <Pantry />
        </ProtectedRoute>
      } />
      <Route path="/family" element={
        <ProtectedRoute>
          <Family />
        </ProtectedRoute>
      } />
      <Route path="/meal-planner" element={
        <ProtectedRoute>
          <MealPlanner />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
