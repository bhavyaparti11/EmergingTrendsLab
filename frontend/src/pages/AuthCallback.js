import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        navigate('/');
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await fetch(`${API}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Clear the hash and navigate
          window.history.replaceState(null, '', '/dashboard');
          navigate('/dashboard', { replace: true, state: { user: userData } });
        } else {
          console.error('Session exchange failed');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    processAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center" data-testid="auth-callback">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto" />
        <p className="mt-4 text-stone-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
