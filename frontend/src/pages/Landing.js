import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { ChefHat, Leaf, Users, Camera } from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#fafaf9] noise-texture" data-testid="landing-page">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between p-6 md:p-8 lg:px-12">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-serif font-bold text-stone-800">SmartMeal</span>
          </div>
          <Button 
            onClick={login}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6"
            data-testid="header-login-btn"
          >
            Sign In
          </Button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 pt-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 tracking-tight">
                Cook Smarter with
                <span className="text-orange-600 block">What You Have</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
                Snap a photo of your groceries, tell us about your family's preferences, 
                and get personalized Indian recipes that everyone will love.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={login}
                  className="bg-orange-600 hover:bg-orange-700 hover:scale-105 text-white rounded-full px-8 py-6 text-lg shadow-lg transition-transform"
                  data-testid="get-started-btn"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-orange-200 text-orange-700 rounded-full px-8 py-6 text-lg hover:bg-orange-50"
                  data-testid="learn-more-btn"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1700227280140-ee5a75cc096b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxmcmVzaCUyMGluZGlhbiUyMHNwaWNlcyUyMGluZ3JlZGllbnRzJTIwb3ZlcmhlYWR8ZW58MHx8fHwxNzc0MTA2MjM3fDA&ixlib=rb-4.1.0&q=85"
                alt="Colorful Indian spices"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-square"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800">Family Friendly</p>
                    <p className="text-sm text-stone-500">Veg, Non-Veg, Vegan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
              How It Works
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Three simple steps to delicious meals tailored to your ingredients and family preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#fafaf9] rounded-2xl p-8 text-center" data-testid="feature-photo">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <Camera className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-3">
                Snap Your Groceries
              </h3>
              <p className="text-stone-600">
                Upload a photo and our AI instantly detects all your ingredients
              </p>
            </div>

            <div className="bg-[#fafaf9] rounded-2xl p-8 text-center" data-testid="feature-family">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-3">
                Add Family Profiles
              </h3>
              <p className="text-stone-600">
                Set dietary preferences and spice tolerance for each family member
              </p>
            </div>

            <div className="bg-[#fafaf9] rounded-2xl p-8 text-center" data-testid="feature-recipes">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-3">
                Get Perfect Recipes
              </h3>
              <p className="text-stone-600">
                Receive personalized Indian & international recipes everyone will enjoy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-8 lg:px-12 bg-gradient-to-br from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Ready to Transform Your Kitchen?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of families who cook smarter with SmartMeal. 
            No more food waste, no more "what's for dinner?" stress.
          </p>
          <Button 
            onClick={login}
            className="bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 rounded-full px-10 py-6 text-lg font-semibold shadow-xl transition-transform"
            data-testid="cta-btn"
          >
            Start Cooking Smarter
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-serif text-white">SmartMeal</span>
          </div>
          <p className="text-sm">© 2026 SmartMeal. Cook smarter, live better.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
