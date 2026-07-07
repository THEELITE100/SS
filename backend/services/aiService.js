const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const rankFreelancersForGig = async (gigTitle, gigDescription, requiredSkills, freelancers) => {
  try {
    const gigText = `Job Title: ${gigTitle}. Description: ${gigDescription}. Skills Needed: ${requiredSkills.join(', ')}`;

    const freelancerTexts = freelancers.map((f) => {
      const skillsString = f.skills.map((s) => `${s.name} (${s.proficiency})`).join(', ');
      return `Freelancer Bio: ${f.bio}. Skills: ${skillsString}`;
    });

    const allTexts = [gigText, ...freelancerTexts];

    const embeddings = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: allTexts,
    });

    const gigVector = embeddings[0];

    const rankedResults = freelancers.map((freelancer, index) => {
      const freelancerVector = embeddings[index + 1];
      const similarityScore = cosineSimilarity(gigVector, freelancerVector);

      const normalizedReputation = (freelancer.reputationScore || 5.0) / 5.0;
      const finalMatchPercentage = Math.round((similarityScore * 0.8 + normalizedReputation * 0.2) * 100);

      return {
        freelancer,
        aiMatchScore: Math.min(Math.max(finalMatchPercentage, 0), 100), // Clamp between 0-100%
      };
    });

    return rankedResults.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
  } catch (error) {
    console.error('Hugging Face AI Service Error:', error.message);
    throw new Error('AI Job Matching Engine failed to process profiles.');
  }
};

module.exports = { rankFreelancersForGig };