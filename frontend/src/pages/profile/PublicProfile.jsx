import { useParams } from 'react-router-dom';
import { Star, MapPin, Briefcase, ShieldCheck, ExternalLink } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ReviewList from '../../components/reviews/ReviewList';
import { useFreelancerProfile } from '../../features/profiles/useProfiles';

function PublicProfile() {
  const { userId } = useParams();
  const { data: profile, isLoading, isError } = useFreelancerProfile(userId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-signal" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="text-graphite">
            This profile couldn&apos;t be loaded — either it doesn&apos;t exist, or the database isn&apos;t
            connected yet.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <Card className="p-8">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-signal-soft text-xl font-medium text-signal">
              {profile.user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-medium text-ink">{profile.user?.name}</h1>
                {profile.verificationBadge !== 'none' && (
                  <Badge tone="verified">
                    <ShieldCheck className="mr-1 inline h-3 w-3" />
                    {profile.verificationBadge === 'top_rated' ? 'Top rated' : 'Verified'}
                  </Badge>
                )}
              </div>
              {profile.headline && <p className="mt-1 text-graphite">{profile.headline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-graphite">
                {profile.user?.location?.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.user.location.city}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-verified" />
                  {profile.reputationScore?.toFixed(1) || 'New'} ({profile.totalReviews || 0} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {profile.completedGigs || 0} completed gigs
                </span>
              </div>
            </div>
            {profile.pricing?.hourlyRate > 0 && (
              <div className="shrink-0 text-right">
                <p className="font-mono text-2xl font-medium text-ink">
                  {profile.pricing.currency} {profile.pricing.hourlyRate}
                </p>
                <p className="text-xs text-graphite">per hour</p>
              </div>
            )}
          </div>

          {profile.bio && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-graphite">{profile.bio}</p>}

          {profile.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-ink">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-md bg-line/60 px-2.5 py-1 text-xs font-medium capitalize text-graphite"
                  >
                    {skill.name} <span className="text-graphite/60">· {skill.proficiency}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {profile.experience?.length > 0 && (
          <Card className="mt-6 p-8">
            <h2 className="text-base font-medium text-ink">Experience</h2>
            <div className="mt-4 space-y-4">
              {profile.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-line pl-4">
                  <p className="text-sm font-medium text-ink">{exp.title}</p>
                  <p className="text-xs text-graphite">
                    {exp.company} · {exp.startDate ? new Date(exp.startDate).getFullYear() : ''}
                    {exp.current ? ' – Present' : exp.endDate ? ` – ${new Date(exp.endDate).getFullYear()}` : ''}
                  </p>
                  {exp.description && <p className="mt-1 text-sm text-graphite">{exp.description}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {profile.portfolio?.length > 0 && (
          <Card className="mt-6 p-8">
            <h2 className="text-base font-medium text-ink">Portfolio</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.portfolio.map((item, i) => (
                <div key={i} className="rounded-lg border border-line p-4">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  {item.description && <p className="mt-1 text-xs text-graphite">{item.description}</p>}
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-signal hover:underline"
                    >
                      View project <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {profile.certifications?.length > 0 && (
          <Card className="mt-6 p-8">
            <h2 className="text-base font-medium text-ink">Certifications</h2>
            <div className="mt-4 space-y-3">
              {profile.certifications.map((cert, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{cert.name}</p>
                    <p className="text-xs text-graphite">{cert.issuer}</p>
                  </div>
                  {cert.issueDate && (
                    <span className="text-xs text-graphite">{new Date(cert.issueDate).getFullYear()}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-6 p-8">
          <h2 className="text-base font-medium text-ink">Reviews</h2>
          <div className="mt-4">
            <ReviewList userId={profile.user?._id} />
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default PublicProfile;
