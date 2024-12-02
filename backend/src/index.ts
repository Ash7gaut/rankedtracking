import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/playerRoutes.js';
import { startAutoUpdateService } from './services/autoUpdateService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://rankedtracking.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()'
  );
  next();
});

app.use(express.json());
app.use('/api/players', playerRoutes);

// Démarrer le service de mise à jour automatique
startAutoUpdateService();

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
