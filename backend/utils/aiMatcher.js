const dotenv = require('../dotenv');
dotenv.config();

const MODEL_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

exports.generateTextEmbeddings = async (text) => {
  try {
    const response = await fetch(MODEL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      throw new Error('AI Inference Engine failed to respond.');
    }

    const embeddingVector = await response.json();
    return embeddingVector; 

  } catch (error) {
    console.error('HuggingFace AI Error:', error);
    return null;
  }
};