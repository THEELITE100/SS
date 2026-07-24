const { getEmbedding, cosineSimilarity } = require('./embeddings');

const PROFICIENCY_WEIGHT = { beginner: 0.5, intermediate: 0.75, expert: 1 };

/**
 * Always computable, no external dependency — this is the tested, reliable
 * foundation. Semantic embeddings (below) only ever ADD to this score,
 * never replace it, so matching works identically whether or not the
 * optional AI layer is installed.
 */
function ruleBasedScore(gig, freelancerProfile) {
  const requiredSkills = (gig.skillsRequired || []).map((s) => s.toLowerCase());
  const freelancerSkills = freelancerProfile.skills || [];

  let skillScore = 0;
  if (requiredSkills.length > 0) {
    const matched = requiredSkills.filter((req) => freelancerSkills.some((s) => s.name.toLowerCase() === req));
    const proficiencySum = matched.reduce((sum, req) => {
      const skill = freelancerSkills.find((s) => s.name.toLowerCase() === req);
      return sum + (PROFICIENCY_WEIGHT[skill?.proficiency] ?? 0.75);
    }, 0);
    skillScore = matched.length > 0 ? proficiencySum / requiredSkills.length : 0;
  }

  const reputationScore = (freelancerProfile.reputationScore || 0) / 5;
  const availabilityBonus =
    freelancerProfile.availability?.status === 'available' ? 1 : freelancerProfile.availability?.status === 'busy' ? 0.4 : 0;

  return {
    skillScore: round(skillScore),
    reputationScore: round(reputationScore),
    availabilityBonus: round(availabilityBonus),
    matchedSkillCount: requiredSkills.filter((req) => freelancerSkills.some((s) => s.name.toLowerCase() === req)).length,
    combined: skillScore * 0.65 + reputationScore * 0.25 + availabilityBonus * 0.1,
  };
}

async function semanticBoost(gig, freelancerProfile) {
  const freelancerText = `${freelancerProfile.headline || ''}. ${freelancerProfile.bio || ''}`.trim();
  if (freelancerText.length < 3) return null;

  const gigText = `${gig.title}. ${gig.description}`;
  const [gigEmbedding, freelancerEmbedding] = await Promise.all([getEmbedding(gigText), getEmbedding(freelancerText)]);

  if (!gigEmbedding || !freelancerEmbedding) return null;
  return round(cosineSimilarity(gigEmbedding, freelancerEmbedding));
}

/** Scores one freelancer against one gig. Blends in the semantic boost only when it's available. */
async function scoreFreelancerForGig(gig, freelancerProfile) {
  const rule = ruleBasedScore(gig, freelancerProfile);
  const semantic = await semanticBoost(gig, freelancerProfile);

  const finalScore = semantic !== null ? rule.combined * 0.75 + Math.max(0, semantic) * 0.25 : rule.combined;

  return {
    score: round(finalScore),
    breakdown: { ...rule, semantic },
    usedAI: semantic !== null,
  };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

module.exports = { scoreFreelancerForGig, ruleBasedScore };
