require('dotenv').config();

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const gigRoutes = require('./routes/gigRoutes');
const proposalRoutes = require('./routes/proposalRoutes');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();
const server = http.createServer(app);

app.use(helmet());

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://ss-two-pi.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests generated from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/gigs', require('./routes/gigRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/disputes', require('./routes/disputeRoutes'));
app.use('/api/analytics/freelancer', require('./routes/freelancerAnalyticsRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/proposals', proposalRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'SkillSphere API Engine',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

const io = initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SkillSphere Master Backend running on port ${PORT}`);
});