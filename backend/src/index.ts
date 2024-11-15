import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/playerRoutes.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuration CORS
app.use(cors({
  origin: [
    'https://rankedtracking.vercel.app',
    'http://localhost:3000'  // Pour le développement local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());


// Routes
app.use('/api/players', playerRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});