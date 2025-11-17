// Load environment variables before other imports that depend on them
import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import judgeRoutes from './routes/judgeRoutes.js';

// dotenv already loaded via import 'dotenv/config' above, keep explicit call for clarity
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/judge', judgeRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
