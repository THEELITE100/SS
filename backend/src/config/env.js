const REQUIRED_VARS = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('   Copy backend/.env.example to backend/.env and fill in the values.');
    console.error('   See README.md → "Setup, step by step" for exactly where to get each one.\n');
    process.exit(1);
  }
}

module.exports = { validateEnv };
