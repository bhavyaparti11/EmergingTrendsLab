import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  ChefHat, Package, Users, Utensils, Camera, Plus, LogOut, 
  Loader2, AlertCircle, Home, User
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [pantry, setPantry] = useState({ ingredients: [] });
  const [family, setFamily] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [pantryRes, familyRes] = await Promise.all([
        fetch(`${API}/pantry`, { credentials: 'include' }),
        fetch(`${API}/family`, { credentials: 'include' })
      ]);
      
      if (pantryRes.ok) {
        const pantryData = await pantryRes.json();
        setPantry(pantryData);
      }
      if (familyRes.ok) {
        const familyData = await familyRes.json();
        setFamily(familyData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center" data-testid="dashboard-loading">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const ingredientCount = pantry.ingredients?.length || 0;
  const familyCount = family.members?.length || 0;

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-20 md:pb-0" data-testid="dashboard">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between p-6 lg:px-12 bg-white border-b border-stone-100">
        <div className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-orange-600" />
          <span className="text-2xl font-serif font-bold text-stone-800">SmartMeal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-stone-700">{user.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-stone-500 hover:text-stone-700"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-stone-100">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-orange-600" />
          <span className="text-xl font-serif font-bold text-stone-800">SmartMeal</span>
        </div>
        <Avatar className="w-9 h-9">
          <AvatarImage src={user.picture} alt={user.name} />
          <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
            {user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">
            Hello, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-stone-600">What are we cooking today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="bg-white rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/pantry')}
            data-testid="pantry-stat-card"
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-stone-800">{ingredientCount}</p>
              <p className="text-sm text-stone-500">Ingredients</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/family')}
            data-testid="family-stat-card"
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-stone-800">{familyCount}</p>
              <p className="text-sm text-stone-500">Family Members</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white rounded-2xl cursor-pointer hover:shadow-lg transition-shadow col-span-2"
            onClick={() => navigate('/meal-planner')}
            data-testid="plan-meal-card"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">Plan a Meal</p>
                <p className="text-sm text-stone-500">Get AI recipe suggestions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pantry Preview */}
          <Card className="bg-white rounded-2xl" data-testid="pantry-preview">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-serif">Your Pantry</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/pantry')}
                className="text-orange-600 hover:text-orange-700"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {ingredientCount === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-stone-400" />
                  </div>
                  <p className="text-stone-500 mb-4">Your pantry is empty</p>
                  <Button 
                    onClick={() => navigate('/pantry')}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                    data-testid="add-ingredients-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Ingredients
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {pantry.ingredients.slice(0, 5).map((ing) => (
                      <div 
                        key={ing.ingredient_id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                      >
                        <span className="font-medium text-stone-700">{ing.name}</span>
                        <span className="text-sm text-stone-500">{ing.quantity} {ing.unit}</span>
                      </div>
                    ))}
                    {ingredientCount > 5 && (
                      <p className="text-center text-sm text-stone-500 py-2">
                        +{ingredientCount - 5} more items
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Family Preview */}
          <Card className="bg-white rounded-2xl" data-testid="family-preview">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-serif">Family Profiles</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/family')}
                className="text-orange-600 hover:text-orange-700"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {familyCount === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-stone-400" />
                  </div>
                  <p className="text-stone-500 mb-4">No family members added</p>
                  <Button 
                    onClick={() => navigate('/family')}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                    data-testid="add-family-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Member
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {family.members.map((member) => (
                    <div 
                      key={member.member_id}
                      className="flex flex-col items-center gap-2"
                    >
                      <Avatar className={`w-14 h-14 ${
                        member.spice_tolerance === 'mild' ? 'spice-mild' :
                        member.spice_tolerance === 'medium' ? 'spice-medium' : 'spice-hot'
                      }`}>
                        <AvatarFallback className="bg-stone-100 text-stone-600 font-medium">
                          {member.name?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-stone-700">{member.name}</span>
                      <span className="text-xs text-stone-500 capitalize">{member.dietary_restriction}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white mobile-nav border-t border-stone-100">
        <div className="flex items-center justify-around py-2">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'home' ? 'text-orange-600' : 'text-stone-500'}`}
            onClick={() => { setActiveTab('home'); navigate('/dashboard'); }}
            data-testid="nav-home"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'pantry' ? 'text-orange-600' : 'text-stone-500'}`}
            onClick={() => { setActiveTab('pantry'); navigate('/pantry'); }}
            data-testid="nav-pantry"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Pantry</span>
          </Button>
          <Button 
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 -mt-4 bg-orange-600 text-white rounded-full w-14 h-14 hover:bg-orange-700 hover:text-white"
            onClick={() => navigate('/meal-planner')}
            data-testid="nav-cook"
          >
            <Utensils className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'family' ? 'text-orange-600' : 'text-stone-500'}`}
            onClick={() => { setActiveTab('family'); navigate('/family'); }}
            data-testid="nav-family"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Family</span>
          </Button>
          <Button 
            variant="ghost"
            className={`flex flex-col items-center gap-1 h-auto py-2 text-stone-500`}
            onClick={logout}
            data-testid="nav-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
