import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users.js';

const app = express();

app.use(cors());
app.use(express.json());

// Use the users router for /api/users routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});