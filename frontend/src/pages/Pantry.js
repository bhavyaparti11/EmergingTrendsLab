import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { 
  ChefHat, ArrowLeft, Camera, Plus, Trash2, Edit2, Loader2, 
  Upload, Package, X
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'grains', label: 'Grains & Pulses' },
  { value: 'spices', label: 'Spices' },
  { value: 'other', label: 'Other' }
];

const Pantry = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [pantry, setPantry] = useState({ ingredients: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    unit: '',
    category: 'other'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPantry();
  }, [user]);

  const fetchPantry = async () => {
    try {
      const res = await fetch(`${API}/pantry`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPantry(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load pantry');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API}/ai/detect-ingredients`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ingredients && data.ingredients.length > 0) {
          // Add detected ingredients
          for (const ing of data.ingredients) {
            await fetch(`${API}/pantry/ingredient`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ing)
            });
          }
          toast.success(`Detected ${data.ingredients.length} ingredients!`);
          fetchPantry();
        } else {
          toast.info('No ingredients detected. Try a clearer photo.');
        }
      } else {
        toast.error('Failed to analyze image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddIngredient = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter ingredient name');
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch(`${API}/pantry/ingredient/${editingItem.ingredient_id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast.success('Ingredient updated');
        }
      } else {
        const res = await fetch(`${API}/pantry/ingredient`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast.success('Ingredient added');
        }
      }
      fetchPantry();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save ingredient');
    }
  };

  const handleDelete = async (ingredientId) => {
    try {
      const res = await fetch(`${API}/pantry/ingredient/${ingredientId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Ingredient removed');
        fetchPantry();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove ingredient');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', quantity: '1', unit: '', category: 'other' });
    setEditingItem(null);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || '',
      category: item.category || 'other'
    });
    setDialogOpen(true);
  };

  const groupedIngredients = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = pantry.ingredients?.filter(i => i.category === cat.value) || [];
    return acc;
  }, {});

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-6" data-testid="pantry-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-800">My Pantry</h1>
              <p className="text-sm text-stone-500">{pantry.ingredients?.length || 0} items</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-orange-200 text-orange-700 rounded-full"
              data-testid="photo-upload-btn"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Scan Photo</span>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                  data-testid="add-ingredient-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Add Item</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" data-testid="ingredient-dialog">
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingItem ? 'Edit Ingredient' : 'Add Ingredient'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ingredient Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Tomatoes, Paneer, Dal"
                      data-testid="ingredient-name-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="1"
                        data-testid="ingredient-quantity-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="kg, pcs, cups"
                        data-testid="ingredient-unit-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="ingredient-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" className="rounded-full">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddIngredient}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                    data-testid="save-ingredient-btn"
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Upload Zone (when empty) */}
        {(!pantry.ingredients || pantry.ingredients.length === 0) && (
          <Card 
            className="bg-white rounded-2xl border-2 border-dashed border-orange-200 cursor-pointer hover:bg-orange-50/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            data-testid="upload-zone"
          >
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
                <Camera className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-2">
                Snap Your Groceries
              </h3>
              <p className="text-stone-500 text-center max-w-sm mb-6">
                Upload a photo of your ingredients and our AI will automatically detect them
              </p>
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <Upload className="w-4 h-4" />
                <span>JPEG, PNG, or WebP</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ingredients List */}
        {pantry.ingredients && pantry.ingredients.length > 0 && (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-6">
              {CATEGORIES.map(cat => {
                const items = groupedIngredients[cat.value];
                if (!items || items.length === 0) return null;
                
                return (
                  <div key={cat.value}>
                    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
                      {cat.label}
                    </h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <Card 
                          key={item.ingredient_id}
                          className="bg-white rounded-xl shadow-sm"
                          data-testid={`ingredient-item-${item.ingredient_id}`}
                        >
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                cat.value === 'vegetables' ? 'bg-green-100' :
                                cat.value === 'fruits' ? 'bg-yellow-100' :
                                cat.value === 'dairy' ? 'bg-blue-100' :
                                cat.value === 'meat' ? 'bg-red-100' :
                                cat.value === 'spices' ? 'bg-orange-100' :
                                'bg-stone-100'
                              }`}>
                                <Package className={`w-5 h-5 ${
                                  cat.value === 'vegetables' ? 'text-green-600' :
                                  cat.value === 'fruits' ? 'text-yellow-600' :
                                  cat.value === 'dairy' ? 'text-blue-600' :
                                  cat.value === 'meat' ? 'text-red-600' :
                                  cat.value === 'spices' ? 'text-orange-600' :
                                  'text-stone-600'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-stone-800">{item.name}</p>
                                <p className="text-sm text-stone-500">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(item)}
                                className="text-stone-400 hover:text-orange-600"
                                data-testid={`edit-ingredient-${item.ingredient_id}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(item.ingredient_id)}
                                className="text-stone-400 hover:text-red-600"
                                data-testid={`delete-ingredient-${item.ingredient_id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
};

export default Pantry;
