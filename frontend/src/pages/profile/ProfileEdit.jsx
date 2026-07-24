import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useMyProfile, useUpdateProfile } from '../../features/profiles/useProfiles';
import { useConnectStatus, useStartConnectOnboarding } from '../../features/payments/usePayments';

const emptyRow = (fields) => ({ key: crypto.randomUUID(), ...fields });

function RepeatableSection({ title, items, setItems, renderRow, newRow }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-paper">{title}</h3>
        <Button type="button" variant="ghostDark" size="sm" onClick={() => setItems((prev) => [...prev, newRow()])}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="mt-3 space-y-3">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-end gap-3 rounded-lg border border-ink-line p-4">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">{renderRow(item, i)}</div>
            <button
              type="button"
              onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
              className="mb-1 rounded-lg p-2.5 text-graphite-dark hover:bg-danger/10 hover:text-danger"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-graphite-dark">Nothing added yet.</p>}
      </div>
    </div>
  );
}

function darkInputClass() {
  return 'w-full rounded-lg border border-ink-line bg-ink px-3.5 py-2 text-sm text-paper placeholder:text-graphite-dark focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal';
}

function PayoutAccountCard() {
  const { data: status, isLoading } = useConnectStatus();
  const startOnboarding = useStartConnectOnboarding();

  const handleConnect = () => {
    startOnboarding.mutate(undefined, {
      onSuccess: (url) => {
        window.location.href = url;
      },
    });
  };

  return (
    <Card dark className="p-6">
      <h3 className="text-sm font-medium text-paper">Payout account</h3>
      <p className="mt-1 text-xs text-graphite-dark">
        Connect a Stripe account so milestone payments can be transferred to you when a client approves them.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-graphite-dark">Checking status...</p>
      ) : status?.payoutsEnabled ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Connected and ready to receive payouts
        </div>
      ) : (
        <Button type="button" variant="secondaryDark" className="mt-4" onClick={handleConnect} isLoading={startOnboarding.isPending}>
          {status?.connected ? 'Finish onboarding' : 'Connect with Stripe'}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      )}
    </Card>
  );
}

function FreelancerForm({ profile }) {
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({ headline: '', bio: '', availabilityStatus: 'available', hourlyRate: '', currency: 'USD' });
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      headline: profile.headline || '',
      bio: profile.bio || '',
      availabilityStatus: profile.availability?.status || 'available',
      hourlyRate: profile.pricing?.hourlyRate || '',
      currency: profile.pricing?.currency || 'USD',
    });
    setSkills((profile.skills || []).map((s) => ({ key: crypto.randomUUID(), name: s.name, proficiency: s.proficiency })));
    setPortfolio((profile.portfolio || []).map((p) => ({ key: crypto.randomUUID(), ...p })));
    setExperience((profile.experience || []).map((e) => ({ key: crypto.randomUUID(), ...e })));
    setCertifications((profile.certifications || []).map((c) => ({ key: crypto.randomUUID(), ...c })));
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate({
      headline: form.headline,
      bio: form.bio,
      availability: { status: form.availabilityStatus },
      pricing: { hourlyRate: Number(form.hourlyRate) || 0, currency: form.currency },
      skills: skills.filter((s) => s.name).map(({ name, proficiency }) => ({ name, proficiency: proficiency || 'intermediate' })),
      portfolio: portfolio.filter((p) => p.title).map(({ title, description, projectUrl, imageUrl }) => ({ title, description, projectUrl, imageUrl })),
      experience: experience.filter((e) => e.title).map(({ title, company, startDate, endDate, current, description }) => ({ title, company, startDate, endDate, current, description })),
      certifications: certifications.filter((c) => c.name).map(({ name, issuer, issueDate, credentialUrl }) => ({ name, issuer, issueDate, credentialUrl })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PayoutAccountCard />

      <Card dark className="space-y-4 p-6">
        <Input label="Headline" placeholder="e.g. Full-stack developer specializing in React" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="border-ink-line bg-ink text-paper placeholder:text-graphite-dark" />
        <div>
          <label className="mb-2 block text-sm font-medium text-graphite-dark">Bio</label>
          <textarea rows={4} maxLength={2000} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={darkInputClass()} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-graphite-dark">Availability</label>
            <select value={form.availabilityStatus} onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })} className={darkInputClass()}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <Input label="Hourly rate" type="number" min="0" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className="border-ink-line bg-ink text-paper" />
        </div>
      </Card>

      <Card dark className="p-6">
        <RepeatableSection
          title="Skills"
          items={skills}
          setItems={setSkills}
          newRow={() => emptyRow({ name: '', proficiency: 'intermediate' })}
          renderRow={(item, i) => (
            <>
              <input placeholder="Skill name" value={item.name} onChange={(e) => setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, name: e.target.value } : s)))} className={darkInputClass()} />
              <select value={item.proficiency} onChange={(e) => setSkills((prev) => prev.map((s, idx) => (idx === i ? { ...s, proficiency: e.target.value } : s)))} className={darkInputClass()}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </>
          )}
        />
      </Card>

      <Card dark className="p-6">
        <RepeatableSection
          title="Portfolio"
          items={portfolio}
          setItems={setPortfolio}
          newRow={() => emptyRow({ title: '', projectUrl: '' })}
          renderRow={(item, i) => (
            <>
              <input placeholder="Project title" value={item.title || ''} onChange={(e) => setPortfolio((prev) => prev.map((p, idx) => (idx === i ? { ...p, title: e.target.value } : p)))} className={darkInputClass()} />
              <input placeholder="Link (optional)" value={item.projectUrl || ''} onChange={(e) => setPortfolio((prev) => prev.map((p, idx) => (idx === i ? { ...p, projectUrl: e.target.value } : p)))} className={darkInputClass()} />
            </>
          )}
        />
      </Card>

      <Card dark className="p-6">
        <RepeatableSection
          title="Experience"
          items={experience}
          setItems={setExperience}
          newRow={() => emptyRow({ title: '', company: '' })}
          renderRow={(item, i) => (
            <>
              <input placeholder="Role title" value={item.title || ''} onChange={(e) => setExperience((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))} className={darkInputClass()} />
              <input placeholder="Company" value={item.company || ''} onChange={(e) => setExperience((prev) => prev.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)))} className={darkInputClass()} />
            </>
          )}
        />
      </Card>

      <Card dark className="p-6">
        <RepeatableSection
          title="Certifications"
          items={certifications}
          setItems={setCertifications}
          newRow={() => emptyRow({ name: '', issuer: '' })}
          renderRow={(item, i) => (
            <>
              <input placeholder="Certification name" value={item.name || ''} onChange={(e) => setCertifications((prev) => prev.map((c, idx) => (idx === i ? { ...c, name: e.target.value } : c)))} className={darkInputClass()} />
              <input placeholder="Issuer" value={item.issuer || ''} onChange={(e) => setCertifications((prev) => prev.map((c, idx) => (idx === i ? { ...c, issuer: e.target.value } : c)))} className={darkInputClass()} />
            </>
          )}
        />
      </Card>

      <Button type="submit" size="lg" isLoading={updateProfile.isPending}>
        Save profile
      </Button>
    </form>
  );
}

function ClientForm({ profile }) {
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({ companyName: '', about: '', industry: '' });

  useEffect(() => {
    if (!profile) return;
    setForm({ companyName: profile.companyName || '', about: profile.about || '', industry: profile.industry || '' });
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card dark className="space-y-4 p-6">
        <Input label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="border-ink-line bg-ink text-paper" />
        <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="border-ink-line bg-ink text-paper" />
        <div>
          <label className="mb-2 block text-sm font-medium text-graphite-dark">About</label>
          <textarea rows={5} maxLength={2000} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className={darkInputClass()} />
        </div>
      </Card>
      <Button type="submit" size="lg" isLoading={updateProfile.isPending}>
        Save profile
      </Button>
    </form>
  );
}

function ProfileEdit() {
  const { user } = useSelector((state) => state.auth);
  const { data: profile, isLoading } = useMyProfile();

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-paper">Edit your profile</h1>
      <p className="mt-1 text-graphite-dark">
        {user?.role === 'freelancer'
          ? 'This is what clients see when they view your profile or review a proposal.'
          : 'This is what freelancers see about your company.'}
      </p>

      <div className="mt-8">
        {isLoading && <p className="text-graphite-dark">Loading...</p>}
        {!isLoading && user?.role === 'freelancer' && <FreelancerForm profile={profile} />}
        {!isLoading && user?.role === 'client' && <ClientForm profile={profile} />}
      </div>
    </div>
  );
}

export default ProfileEdit;
