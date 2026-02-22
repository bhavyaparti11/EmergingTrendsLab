import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ChefHat, ArrowLeft, Plus, Trash2, Edit2, Loader2, Users
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DIETARY_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' }
];

const SPICE_OPTIONS = [
  { value: 'mild', label: 'Mild', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'orange' },
  { value: 'hot', label: 'Hot', color: 'red' }
];

const PREFERENCE_OPTIONS = [
  { value: 'high-protein', label: 'High Protein' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'low-fat', label: 'Low Fat' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'dairy-free', label: 'Dairy Free' },
  { value: 'kid-friendly', label: 'Kid Friendly' }
];

const Family = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [family, setFamily] = useState({ members: [] });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dietary_restriction: 'non-veg',
    spice_tolerance: 'medium',
    preferences: []
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchFamily();
  }, [user]);

  const fetchFamily = async () => {
    try {
      const res = await fetch(`${API}/family`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFamily(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load family profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (editingMember) {
        const res = await fetch(`${API}/family/member/${editingMember.member_id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast.success('Member updated');
        }
      } else {
        const res = await fetch(`${API}/family/member`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          toast.success('Member added');
        }
      }
      fetchFamily();
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save member');
    }
  };

  const handleDelete = async (memberId) => {
    try {
      const res = await fetch(`${API}/family/member/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Member removed');
        fetchFamily();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dietary_restriction: 'non-veg',
      spice_tolerance: 'medium',
      preferences: []
    });
    setEditingMember(null);
  };

  const openEditDialog = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      dietary_restriction: member.dietary_restriction,
      spice_tolerance: member.spice_tolerance,
      preferences: member.preferences || []
    });
    setDialogOpen(true);
  };

  const togglePreference = (pref) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-6" data-testid="family-page">
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
              <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-800">Family Profiles</h1>
              <p className="text-sm text-stone-500">{family.members?.length || 0} members</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                data-testid="add-member-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" data-testid="member-dialog">
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mom, Dad, Riya"
                    data-testid="member-name-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Dietary Preference</Label>
                  <Select 
                    value={formData.dietary_restriction} 
                    onValueChange={(value) => setFormData({ ...formData, dietary_restriction: value })}
                  >
                    <SelectTrigger data-testid="dietary-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIETARY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Spice Tolerance</Label>
                  <div className="flex gap-2">
                    {SPICE_OPTIONS.map(opt => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={formData.spice_tolerance === opt.value ? 'default' : 'outline'}
                        className={`flex-1 rounded-full ${
                          formData.spice_tolerance === opt.value
                            ? opt.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                              opt.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                              'bg-red-600 hover:bg-red-700'
                            : ''
                        }`}
                        onClick={() => setFormData({ ...formData, spice_tolerance: opt.value })}
                        data-testid={`spice-${opt.value}-btn`}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Additional Preferences</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {PREFERENCE_OPTIONS.map(pref => (
                      <div key={pref.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref.value}
                          checked={formData.preferences.includes(pref.value)}
                          onCheckedChange={() => togglePreference(pref.value)}
                          data-testid={`pref-${pref.value}`}
                        />
                        <Label htmlFor={pref.value} className="text-sm font-normal cursor-pointer">
                          {pref.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-full">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleSaveMember}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                  data-testid="save-member-btn"
                >
                  {editingMember ? 'Update' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Empty State */}
        {(!family.members || family.members.length === 0) && (
          <Card 
            className="bg-white rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setDialogOpen(true)}
            data-testid="empty-family-card"
          >
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-stone-800 mb-2">
                Add Your Family
              </h3>
              <p className="text-stone-500 text-center max-w-sm mb-6">
                Create profiles for each family member to get personalized recipe suggestions
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Add First Member
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Members Grid */}
        {family.members && family.members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {family.members.map(member => (
              <Card 
                key={member.member_id}
                className="bg-white rounded-2xl overflow-hidden"
                data-testid={`member-card-${member.member_id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className={`w-16 h-16 ${
                      member.spice_tolerance === 'mild' ? 'spice-mild' :
                      member.spice_tolerance === 'medium' ? 'spice-medium' : 'spice-hot'
                    }`}>
                      <AvatarFallback className="bg-stone-100 text-stone-600 text-xl font-medium">
                        {member.name?.charAt(0) || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(member)}
                        className="text-stone-400 hover:text-orange-600"
                        data-testid={`edit-member-${member.member_id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(member.member_id)}
                        className="text-stone-400 hover:text-red-600"
                        data-testid={`delete-member-${member.member_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">{member.name}</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.dietary_restriction === 'veg' ? 'bg-green-100 text-green-700' :
                      member.dietary_restriction === 'vegan' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {member.dietary_restriction === 'veg' ? 'Vegetarian' :
                       member.dietary_restriction === 'vegan' ? 'Vegan' : 'Non-Veg'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.spice_tolerance === 'mild' ? 'bg-green-100 text-green-700' :
                      member.spice_tolerance === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {member.spice_tolerance === 'mild' ? 'Mild' :
                       member.spice_tolerance === 'medium' ? 'Medium' : 'Hot'} Spice
                    </span>
                  </div>
                  
                  {member.preferences && member.preferences.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {member.preferences.map(pref => (
                        <span 
                          key={pref}
                          className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs"
                        >
                          {PREFERENCE_OPTIONS.find(p => p.value === pref)?.label || pref}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Family;
