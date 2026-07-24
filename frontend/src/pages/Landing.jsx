import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Radar, Wallet, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const satellites = [
  [116.4, 299.6],
  [87.4, 135],
  [265, 87.4],
];

function MatchOrbit() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="mx-auto w-full max-w-sm"
      role="img"
      aria-label="Diagram showing a posted project matched to one verified nearby freelancer out of several candidates"
    >
      <motion.circle
        cx="200"
        cy="200"
        r="130"
        fill="none"
        stroke="#E2E4E7"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        style={{ transformOrigin: '200px 200px' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="70"
        fill="none"
        stroke="#E2E4E7"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        style={{ transformOrigin: '200px 200px' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      />

      <motion.line
        x1="200"
        y1="200"
        x2="299.6"
        y2="283.6"
        stroke="#1F5FE0"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
      />

      {satellites.map(([cx, cy], i) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="7"
          fill="#FFFFFF"
          stroke="#9A9DA3"
          strokeWidth="1.5"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease: 'backOut' }}
        />
      ))}

      <motion.circle
        cx="299.6"
        cy="283.6"
        r="18"
        fill="#1F5FE0"
        style={{ transformOrigin: '299.6px 283.6px' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.9, 1.15, 0.9], opacity: 0.16 }}
        transition={{
          scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 },
          opacity: { duration: 0.6, delay: 1.3 },
        }}
      />
      <motion.circle
        cx="299.6"
        cy="283.6"
        r="9"
        fill="#1F5FE0"
        style={{ transformOrigin: '299.6px 283.6px' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.3, ease: 'backOut' }}
      />

      <motion.circle
        cx="200"
        cy="200"
        r="24"
        fill="#0E1013"
        style={{ transformOrigin: '200px 200px' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
      />
    </svg>
  );
}

const steps = [
  {
    n: '01',
    title: 'Post what you need',
    body: 'Describe the project, set a budget range, and list the skills it calls for.',
  },
  {
    n: '02',
    title: 'Get matched',
    body: 'The matching engine scores nearby freelancers on skill similarity and reputation.',
  },
  {
    n: '03',
    title: 'Work, paid by milestone',
    body: 'Funds sit in escrow per milestone and release only once you approve the work.',
  },
  {
    n: '04',
    title: 'Build verified reputation',
    body: 'Every review ties back to one real, completed, paid gig — not just a star rating.',
  },
];

const trustPoints = [
  {
    icon: Radar,
    title: 'Skill-similarity matching',
    body: 'Ranks candidates by how closely their skills fit the brief, not just keyword filters.',
  },
  {
    icon: Wallet,
    title: 'Escrow milestone payments',
    body: 'Money is held securely and released only when a milestone is marked approved.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified badges',
    body: 'Identity and skill-verified freelancers are marked clearly across the platform.',
  },
  {
    icon: Star,
    title: 'Weighted reputation',
    body: 'Scores are built from verified work history, with fraud detection on suspicious reviews.',
  },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero */}
      <section className="px-6 pb-20 pt-16 lg:px-8 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-paper-raised px-3.5 py-1.5 text-xs font-medium text-graphite"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              Hyperlocal freelancing, AI-matched
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl"
            >
              Matched by skill.
              <br />
              Verified by work.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-graphite"
            >
              SkillSphere connects clients with skilled professionals nearby — scored by real
              skill similarity, protected by escrow milestones, and proven by verified work
              history rather than star ratings alone.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Button size="lg" onClick={() => navigate('/register?role=client')}>
                Post a project
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/register?role=freelancer')}>
                Find work near you
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MatchOrbit />
          </motion.div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbering earns its place */}
      <section id="how-it-works" className="border-t border-line px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            How a project moves through SkillSphere
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="font-mono text-sm text-signal">{step.n}</span>
                <h3 className="mt-3 text-base font-medium text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & safety */}
      <section id="trust" className="border-t border-line px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Built so both sides can trust the outcome
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card className="flex h-full gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-soft">
                    <point.icon className="h-5 w-5 text-signal" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-ink">{point.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-graphite">{point.body}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark closing band — the one deliberate contrast move on the page */}
      <section className="bg-ink px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight text-paper sm:text-4xl">
            Your first match is a few minutes away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-graphite-dark">
            Create an account, tell us what you need or what you do, and let the matching engine
            take it from there.
          </p>
          <div className="mt-9 flex justify-center">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create your free account
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
