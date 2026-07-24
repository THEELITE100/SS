import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TagInput from '../../components/ui/TagInput';
import { CATEGORIES } from '../../constants/categories';
import { useGig, useCreateGig, useUpdateGig } from '../../features/gigs/useGigs';

const emptyMilestone = () => ({ key: crypto.randomUUID(), title: '', amount: '', dueDate: '' });

const emptyForm = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  skillsRequired: [],
  budgetType: 'fixed',
  budgetMin: '',
  budgetMax: '',
  currency: 'USD',
  isRemote: true,
  city: '',
  deadline: '',
};

function GigForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: existingGig } = useGig(isEditing ? id : undefined);
  const createGig = useCreateGig();
  const updateGig = useUpdateGig(id);

  const [form, setForm] = useState(emptyForm);
  const [milestones, setMilestones] = useState([emptyMilestone()]);

  useEffect(() => {
    if (existingGig) {
      setForm({
        title: existingGig.title,
        description: existingGig.description,
        category: existingGig.category,
        skillsRequired: existingGig.skillsRequired || [],
        budgetType: existingGig.budgetType,
        budgetMin: existingGig.budgetMin,
        budgetMax: existingGig.budgetMax,
        currency: existingGig.currency,
        isRemote: existingGig.location?.isRemote ?? true,
        city: existingGig.location?.city || '',
        deadline: existingGig.deadline ? existingGig.deadline.slice(0, 10) : '',
      });
      if (existingGig.milestones?.length) {
        setMilestones(existingGig.milestones.map((m) => ({ key: m._id, title: m.title, amount: m.amount, dueDate: m.dueDate ? m.dueDate.slice(0, 10) : '' })));
      }
    }
  }, [existingGig]);

  if (user && user.role !== 'client') {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-graphite">Only client accounts can post or edit gigs.</p>
          <Link to="/gigs" className="mt-4 inline-block text-signal hover:underline">
            Browse open gigs instead
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const updateMilestone = (key, patch) => {
    setMilestones((prev) => prev.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  const removeMilestone = (key) => {
    setMilestones((prev) => prev.filter((m) => m.key !== key));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      skillsRequired: form.skillsRequired,
      budgetType: form.budgetType,
      budgetMin: Number(form.budgetMin),
      budgetMax: Number(form.budgetMax),
      currency: form.currency,
      location: { isRemote: form.isRemote, city: form.city },
      deadline: form.deadline || undefined,
      milestones: milestones
        .filter((m) => m.title && m.amount)
        .map((m) => ({ title: m.title, amount: Number(m.amount), dueDate: m.dueDate || undefined })),
    };

    if (isEditing) {
      const result = await updateGig.mutateAsync(payload);
      navigate(`/gigs/${result._id}`);
    } else {
      const result = await createGig.mutateAsync(payload);
      navigate(`/gigs/${result._id}`);
    }
  };

  const isSaving = createGig.isPending || updateGig.isPending;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          {isEditing ? 'Edit gig' : 'Post a new gig'}
        </h1>
        <p className="mt-2 text-graphite">
          {isEditing ? 'You can edit this until a freelancer is assigned.' : 'Describe what you need done.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Card className="space-y-5 p-6">
            <Input
              label="Title"
              required
              maxLength={150}
              placeholder="e.g. Build a responsive React landing page"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-graphite">Description</label>
              <textarea
                required
                rows={6}
                maxLength={5000}
                placeholder="What does the project involve? What does success look like?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-graphite">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <TagInput
              label="Skills required"
              value={form.skillsRequired}
              onChange={(skillsRequired) => setForm({ ...form, skillsRequired })}
              placeholder="e.g. React, Figma, Copywriting — press Enter to add"
            />
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-base font-medium text-ink">Budget</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, budgetType: 'fixed' })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.budgetType === 'fixed' ? 'border-signal bg-signal-soft text-signal' : 'border-line text-graphite'
                }`}
              >
                Fixed price
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, budgetType: 'hourly' })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.budgetType === 'hourly' ? 'border-signal bg-signal-soft text-signal' : 'border-line text-graphite'
                }`}
              >
                Hourly
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Min budget"
                type="number"
                min="0"
                required
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
              />
              <Input
                label="Max budget"
                type="number"
                min="0"
                required
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-graphite">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
                >
                  {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="text-base font-medium text-ink">Location</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isRemote: true })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.isRemote ? 'border-signal bg-signal-soft text-signal' : 'border-line text-graphite'
                }`}
              >
                Remote
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isRemote: false })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  !form.isRemote ? 'border-signal bg-signal-soft text-signal' : 'border-line text-graphite'
                }`}
              >
                On-site
              </button>
            </div>
            {!form.isRemote && (
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Austin, TX"
              />
            )}
            <Input
              label="Deadline (optional)"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Card>

          <Card className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-ink">Milestones (optional)</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMilestones((prev) => [...prev, emptyMilestone()])}
              >
                <Plus className="h-4 w-4" /> Add milestone
              </Button>
            </div>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.key} className="flex items-end gap-3 rounded-lg border border-line p-4">
                  <div className="flex-1">
                    <Input
                      label="Milestone title"
                      value={m.title}
                      onChange={(e) => updateMilestone(m.key, { title: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Amount"
                      type="number"
                      min="0"
                      value={m.amount}
                      onChange={(e) => updateMilestone(m.key, { amount: e.target.value })}
                    />
                  </div>
                  <div className="w-40">
                    <Input
                      label="Due date"
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => updateMilestone(m.key, { dueDate: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.key)}
                    className="mb-2.5 rounded-lg p-2.5 text-graphite hover:bg-danger/10 hover:text-danger"
                    aria-label="Remove milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-sm text-graphite">
                  No milestones — the full budget will be treated as a single payment.
                </p>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" isLoading={isSaving}>
              {isEditing ? 'Save changes' : 'Post gig'}
            </Button>
            <Link to={isEditing ? `/gigs/${id}` : '/dashboard/gigs'}>
              <Button type="button" variant="ghost" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default GigForm;
