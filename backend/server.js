require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { validateEnv } = require('./src/config/env');

validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 SkillSphere API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
