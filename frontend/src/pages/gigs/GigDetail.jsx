import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Calendar, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StarRating from '../../components/ui/StarRating';
import FundMilestoneModal from '../../components/payments/FundMilestoneModal';
import RaiseDisputeModal from '../../components/disputes/RaiseDisputeModal';
import ReviewForm from '../../components/reviews/ReviewForm';
import { useGig, useCancelGig, useUpdateMilestone } from '../../features/gigs/useGigs';
import { useProposalsForGig, useMyProposals, useCreateProposal, useAcceptProposal, useRejectProposal } from '../../features/proposals/useProposals';
import { usePaymentsForGig } from '../../features/payments/usePayments';
import { useGetOrCreateConversation } from '../../features/chat/useChat';
import { useMatchesForGig } from '../../features/matching/useMatching';
import { useReviewsForUser } from '../../features/reviews/useReviews';

function formatBudget(gig) {
  const unit = gig.budgetType === 'hourly' ? '/hr' : '';
  return `${gig.currency} ${gig.budgetMin?.toLocaleString()}–${gig.budgetMax?.toLocaleString()}${unit}`;
}

function ProposalForm({ gigId }) {
  const [form, setForm] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const createProposal = useCreateProposal(gigId);

  const handleSubmit = (e) => {
    e.preventDefault();
    createProposal.mutate({
      coverLetter: form.coverLetter,
      bidAmount: Number(form.bidAmount),
      estimatedDays: Number(form.estimatedDays),
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-base font-medium text-ink">Submit a proposal</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-graphite">Cover letter</label>
          <textarea
            required
            rows={5}
            maxLength={3000}
            value={form.coverLetter}
            onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
            placeholder="Explain why you're a good fit for this project..."
            className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Your bid"
            type="number"
            min="0"
            required
            value={form.bidAmount}
            onChange={(e) => setForm({ ...form, bidAmount: e.target.value })}
          />
          <Input
            label="Estimated days"
            type="number"
            min="1"
            required
            value={form.estimatedDays}
            onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" isLoading={createProposal.isPending}>
          Submit proposal
        </Button>
      </form>
    </Card>
  );
}

function MatchesPanel({ gigId }) {
  const { data, isLoading } = useMatchesForGig(gigId);
  const matches = data?.matches || [];

  if (isLoading) return <p className="text-sm text-graphite">Ranking freelancers...</p>;
  if (matches.length === 0) {
    return <p className="text-sm text-graphite">No strong matches yet — check back as more freelancers join.</p>;
  }

  return (
    <div className="space-y-3">
      {data.usedAI && (
        <p className="flex items-center gap-1.5 text-xs text-graphite">
          <Sparkles className="h-3.5 w-3.5 text-signal" />
          Ranked using skill matching plus semantic similarity
        </p>
      )}
      {matches.map(({ profile, score, breakdown }) => (
        <Card key={profile._id} className="flex items-center justify-between gap-4 p-4">
          <Link to={`/freelancers/${profile.user?._id}`} className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-soft text-sm font-medium text-signal">
              {profile.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink hover:text-signal">{profile.user?.name}</p>
              <p className="text-xs text-graphite">
                {breakdown.matchedSkillCount} matching skill{breakdown.matchedSkillCount === 1 ? '' : 's'} · ★{' '}
                {profile.reputationScore?.toFixed(1) || 'New'}
              </p>
            </div>
          </Link>
          <span className="shrink-0 rounded-full bg-signal-soft px-2.5 py-1 font-mono text-xs font-medium text-signal">
            {Math.round(score * 100)}% match
          </span>
        </Card>
      ))}
    </div>
  );
}

function ProposalsPanel({ gig }) {
  const { data: proposals, isLoading } = useProposalsForGig(gig._id);
  const acceptProposal = useAcceptProposal();
  const rejectProposal = useRejectProposal();

  if (isLoading) return <p className="text-sm text-graphite">Loading proposals...</p>;
  if (!proposals || proposals.length === 0) {
    return <p className="text-sm text-graphite">No proposals yet.</p>;
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal._id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-soft text-sm font-medium text-signal">
                {proposal.freelancer?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <Link to={`/freelancers/${proposal.freelancer?._id}`} className="text-sm font-medium text-ink hover:text-signal">
                  {proposal.freelancer?.name}
                </Link>
                <p className="font-mono text-xs text-graphite">
                  Bid: {gig.currency} {proposal.bidAmount?.toLocaleString()} · {proposal.estimatedDays} days
                </p>
              </div>
            </div>
            <Badge status={proposal.status} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-graphite">{proposal.coverLetter}</p>
          {proposal.status === 'pending' && gig.status === 'open' && (
            <div className="mt-4 flex gap-3">
              <Button size="sm" onClick={() => acceptProposal.mutate(proposal._id)} isLoading={acceptProposal.isPending}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => rejectProposal.mutate(proposal._id)}
                isLoading={rejectProposal.isPending}
              >
                Decline
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function MilestoneRow({ gig, milestone, isOwner, isAssignedFreelancer, payments }) {
  const updateMilestone = useUpdateMilestone();
  const [showFundModal, setShowFundModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const payment = payments?.find((p) => p.milestoneId === milestone._id);

  const handleTransition = (status) => {
    updateMilestone.mutate({ gigId: gig._id, milestoneId: milestone._id, status });
  };

  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${['approved', 'paid'].includes(milestone.status) ? 'text-success' : 'text-graphite/40'}`}
          />
          <div>
            <p className="text-sm font-medium text-ink">{milestone.title}</p>
            {milestone.description && <p className="text-xs text-graphite">{milestone.description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-sm text-ink">
            {gig.currency} {milestone.amount?.toLocaleString()}
          </span>
          <Badge status={milestone.status} />
        </div>
      </div>

      {payment && (
        <p className="mt-2 text-xs text-graphite">
          Payment: <Badge status={payment.status} className="ml-1" />
        </p>
      )}

      {gig.status === 'in_progress' && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isOwner && milestone.status === 'pending' && !payment && (
            <Button size="sm" onClick={() => setShowFundModal(true)}>
              Fund milestone
            </Button>
          )}
          {isAssignedFreelancer && milestone.status === 'pending' && (
            <Button size="sm" onClick={() => handleTransition('in_progress')} isLoading={updateMilestone.isPending}>
              Start work
            </Button>
          )}
          {isAssignedFreelancer && milestone.status === 'in_progress' && (
            <Button size="sm" onClick={() => handleTransition('submitted')} isLoading={updateMilestone.isPending}>
              Submit for review
            </Button>
          )}
          {isOwner && milestone.status === 'submitted' && (
            <Button size="sm" onClick={() => handleTransition('approved')} isLoading={updateMilestone.isPending}>
              Approve &amp; release payment
            </Button>
          )}
          {(isOwner || isAssignedFreelancer) && (
            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="ml-auto text-xs text-graphite underline-offset-2 hover:text-danger hover:underline"
            >
              Report an issue
            </button>
          )}
        </div>
      )}

      {showFundModal && (
        <FundMilestoneModal
          gigId={gig._id}
          milestoneId={milestone._id}
          onClose={() => setShowFundModal(false)}
          onSuccess={() => setShowFundModal(false)}
        />
      )}

      {showDisputeModal && (
        <RaiseDisputeModal gigId={gig._id} milestoneId={milestone._id} onClose={() => setShowDisputeModal(false)} />
      )}
    </div>
  );
}

function ReviewSection({ gig, currentUser, isOwner }) {
  const revieweeId = isOwner ? gig.assignedFreelancer?._id : gig.client?._id;
  const revieweeName = isOwner ? gig.assignedFreelancer?.name : gig.client?.name;
  const { data, isLoading } = useReviewsForUser(revieweeId);

  if (!revieweeId) return null;
  if (isLoading) return null;

  const myReview = data?.reviews?.find((r) => r.reviewer?._id === currentUser._id && r.gig?._id === gig._id);

  return (
    <div className="mt-8">
      <h2 className="text-base font-medium text-ink">Review</h2>
      <div className="mt-4">
        {myReview ? (
          <Card className="p-6">
            <p className="text-sm text-graphite">You reviewed {revieweeName}</p>
            <div className="mt-2">
              <StarRating value={myReview.rating} readOnly />
            </div>
            {myReview.comment && <p className="mt-2 text-sm text-graphite">{myReview.comment}</p>}
          </Card>
        ) : (
          <ReviewForm gigId={gig._id} revieweeName={revieweeName} />
        )}
      </div>
    </div>
  );
}

function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, status: authStatus } = useSelector((state) => state.auth);
  const { data: gig, isLoading, isError } = useGig(id);
  const { data: myProposals } = useMyProposals();
  const { data: payments } = usePaymentsForGig(id);
  const cancelGig = useCancelGig();
  const getOrCreateConversation = useGetOrCreateConversation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-signal" />
      </div>
    );
  }

  if (isError || !gig) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="text-graphite">
            This gig couldn&apos;t be loaded — either it doesn&apos;t exist, or the database isn&apos;t connected
            yet.
          </p>
          <Link to="/gigs" className="mt-4 inline-block text-signal hover:underline">
            Back to browse
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwner = user && String(gig.client?._id) === String(user._id);
  const isAssignedFreelancer = user && gig.assignedFreelancer && String(gig.assignedFreelancer._id) === String(user._id);
  const myProposal = myProposals?.find((p) => p.gig?._id === gig._id || p.gig === gig._id);
  const canApply = authStatus === 'authenticated' && user.role === 'freelancer' && gig.status === 'open' && !myProposal;
  const otherPartyId = isOwner ? gig.assignedFreelancer?._id : isAssignedFreelancer ? gig.client?._id : null;

  const handleMessage = () => {
    getOrCreateConversation.mutate(
      { participantId: otherPartyId, gigId: gig._id },
      { onSuccess: (conversation) => navigate(`/dashboard/messages?conversation=${conversation._id}`) }
    );
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center gap-2">
              <Badge status={gig.status} />
              <span className="text-sm text-graphite">{gig.category}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink">{gig.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-graphite">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {gig.location?.isRemote ? 'Remote' : gig.location?.city || 'On-site'}
              </span>
              {gig.deadline && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Due {new Date(gig.deadline).toLocaleDateString()}
                </span>
              )}
              <span>Posted by {gig.client?.name}</span>
            </div>

            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-graphite">{gig.description}</p>

            {gig.skillsRequired?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {gig.skillsRequired.map((skill) => (
                  <span key={skill} className="rounded-md bg-line/60 px-2.5 py-1 text-xs font-medium text-graphite">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {gig.milestones?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium text-ink">Milestones</h2>
                <div className="mt-3 space-y-3">
                  {gig.milestones.map((m) => (
                    <MilestoneRow
                      key={m._id}
                      gig={gig}
                      milestone={m}
                      isOwner={isOwner}
                      isAssignedFreelancer={isAssignedFreelancer}
                      payments={payments}
                    />
                  ))}
                </div>
              </div>
            )}

            {isOwner && gig.status === 'open' && (
              <div className="mt-8">
                <h2 className="text-base font-medium text-ink">Recommended freelancers</h2>
                <div className="mt-4">
                  <MatchesPanel gigId={gig._id} />
                </div>
              </div>
            )}

            {isOwner && gig.status === 'open' && (
              <div className="mt-8">
                <h2 className="text-base font-medium text-ink">Proposals</h2>
                <div className="mt-4">
                  <ProposalsPanel gig={gig} />
                </div>
              </div>
            )}

            {gig.status === 'completed' && (isOwner || isAssignedFreelancer) && (
              <ReviewSection gig={gig} currentUser={user} isOwner={isOwner} />
            )}
          </div>

          <aside className="space-y-5">
            <Card className="p-6">
              <p className="text-sm text-graphite">Budget</p>
              <p className="mt-1 font-mono text-2xl font-medium text-ink">{formatBudget(gig)}</p>
              <p className="mt-1 text-xs capitalize text-graphite">{gig.budgetType} price</p>
            </Card>

            {(isOwner || isAssignedFreelancer) && otherPartyId && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleMessage}
                isLoading={getOrCreateConversation.isPending}
              >
                <MessageSquare className="h-4 w-4" />
                Message {isOwner ? gig.assignedFreelancer?.name : gig.client?.name}
              </Button>
            )}

            {canApply && <ProposalForm gigId={gig._id} />}

            {myProposal && (
              <Card className="p-6">
                <p className="text-sm font-medium text-ink">Your proposal</p>
                <div className="mt-2">
                  <Badge status={myProposal.status} />
                </div>
                <p className="mt-2 font-mono text-sm text-graphite">
                  Bid: {gig.currency} {myProposal.bidAmount?.toLocaleString()}
                </p>
              </Card>
            )}

            {authStatus !== 'authenticated' && gig.status === 'open' && (
              <Card className="p-6 text-center">
                <p className="text-sm text-graphite">Log in as a freelancer to submit a proposal.</p>
                <Button className="mt-4 w-full" onClick={() => navigate('/login')}>
                  Log in
                </Button>
              </Card>
            )}

            {isOwner && gig.status === 'open' && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (window.confirm('Cancel this gig? This cannot be undone.')) {
                    cancelGig.mutate(gig._id, { onSuccess: () => navigate('/dashboard/gigs') });
                  }
                }}
              >
                Cancel this gig
              </Button>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default GigDetail;
