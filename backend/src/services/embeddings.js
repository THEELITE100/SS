/**
 * Optional semantic-matching layer. Deliberately NOT listed in package.json:
 * @huggingface/transformers pulls in a native ONNX runtime whose install can
 * fail on restricted networks, and its current release has a known
 * high-severity transitive vulnerability in a nested dependency (adm-zip,
 * via onnxruntime-node — see README "AI matching" section for the full
 * story and how to opt in if you want it).
 *
 * Everything here is best-effort and loaded via dynamic import at call
 * time, so a normal `npm install` never touches this package at all. If
 * it's not installed, or the model can't be downloaded, matching silently
 * falls back to the rule-based scoring in matchingService.js — nothing
 * else in the app depends on this succeeding.
 */

let embedderPromise = null;
let unavailable = false;

const getEmbedder = async () => {
  if (unavailable) return null;
  if (embedderPromise) return embedderPromise;

  embedderPromise = (async () => {
    try {
      // eslint-disable-next-line import/no-unresolved
      const { pipeline } = await import('@huggingface/transformers');
      return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (error) {
      console.warn(
        '⚠️  AI semantic matching unavailable (this is optional — see README "AI matching"). Using rule-based matching only.'
      );
      unavailable = true;
      return null;
    }
  })();

  return embedderPromise;
};

const getEmbedding = async (text) => {
  if (!text || !text.trim()) return null;
  const embedder = await getEmbedder();
  if (!embedder) return null;

  try {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    return null;
  }
};

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
};

module.exports = { getEmbedding, cosineSimilarity };
