import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { 
  ChefHat, ArrowLeft, Search, Loader2, Clock, Users as UsersIcon, 
  Leaf, Flame, AlertCircle, CheckCircle2, Utensils
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MealPlanner = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter what you want to cook');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`${API}/ai/suggest-recipes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.recipes && data.recipes.length > 0) {
          setRecipes(data.recipes);
          toast.success(`Found ${data.recipes.length} recipes!`);
        } else {
          setRecipes([]);
          toast.info('No recipes found. Try a different query.');
        }
      } else {
        toast.error('Failed to get recipes');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    "Quick dinner for kids",
    "Something with potatoes",
    "High protein lunch",
    "Healthy breakfast",
    "Party snacks",
    "Quick dal recipe"
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-6" data-testid="meal-planner-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100 p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="text-stone-600"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-800">Meal Planner</h1>
            <p className="text-sm text-stone-500">Get AI-powered recipe suggestions</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Search Section */}
        <Card className="bg-white rounded-2xl mb-6" data-testid="search-section">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="What do you want to cook? e.g., 'quick dinner for kids'"
                  className="pl-12 py-6 text-lg rounded-full border-stone-200 focus:ring-2 focus:ring-orange-200"
                  data-testid="meal-query-input"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
                data-testid="search-recipes-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Get Recipes'
                )}
              </Button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-stone-600 border-stone-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                  onClick={() => { setQuery(suggestion); }}
                  data-testid={`suggestion-${idx}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="loading-state">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 animate-pulse-orange">
              <ChefHat className="w-10 h-10 text-orange-600" />
            </div>
            <p className="text-lg text-stone-600">Finding perfect recipes...</p>
            <p className="text-sm text-stone-400 mt-2">Analyzing your pantry & preferences</p>
          </div>
        )}

        {/* Empty State (before search) */}
        {!loading && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="empty-state">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <Utensils className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-stone-800 mb-2">
              Ready to Cook?
            </h3>
            <p className="text-stone-500 text-center max-w-md">
              Tell us what you're in the mood for and we'll suggest recipes based on 
              your pantry and family preferences
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && recipes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16" data-testid="no-results">
            <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-stone-800 mb-2">
              No Recipes Found
            </h3>
            <p className="text-stone-500 text-center max-w-md mb-6">
              Try a different search or add more ingredients to your pantry
            </p>
            <Button 
              onClick={() => navigate('/pantry')}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
            >
              Add Ingredients
            </Button>
          </div>
        )}

        {/* Recipe Results */}
        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="recipe-results">
            {recipes.map((recipe, idx) => (
              <Card 
                key={idx}
                className="bg-white rounded-2xl overflow-hidden recipe-card shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                data-testid={`recipe-card-${idx}`}
              >
                {/* Recipe Header */}
                <div className={`p-4 ${
                  recipe.cuisine === 'Indian' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                    {recipe.cuisine}
                  </Badge>
                  <h3 className="text-xl font-serif font-bold text-white">{recipe.name}</h3>
                </div>
                
                <CardContent className="p-5">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-stone-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.cooking_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.dietary_info === 'Vegetarian' ? 'bg-green-100 text-green-700' :
                      recipe.dietary_info === 'Vegan' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <Leaf className="w-3 h-3 inline mr-1" />
                      {recipe.dietary_info}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recipe.spice_level === 'Mild' ? 'bg-green-100 text-green-700' :
                      recipe.spice_level === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <Flame className="w-3 h-3 inline mr-1" />
                      {recipe.spice_level}
                    </span>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">Ingredients</h4>
                    <ScrollArea className="h-24">
                      <ul className="space-y-1 text-sm">
                        {recipe.ingredients_needed?.map((ing, i) => (
                          <li key={i} className="flex items-center gap-2 text-stone-600">
                            <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span>{ing.quantity} {ing.name}</span>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  {/* Missing Ingredients */}
                  {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-orange-700 mb-1">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Missing Ingredients
                      </h4>
                      <p className="text-sm text-orange-600">
                        {recipe.missing_ingredients.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Steps */}
                  <div>
                    <h4 className="text-sm font-semibold text-stone-700 mb-2">Steps</h4>
                    <ScrollArea className="h-32">
                      <ol className="space-y-2 text-sm">
                        {recipe.steps?.map((step, i) => (
                          <li key={i} className="flex gap-2 text-stone-600">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-medium">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MealPlanner;
