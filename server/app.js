import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/users.js';
import templateRoutes from './routes/templates.js';
import { authenticateToken } from './middleware/authenticateToken.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

//serve uploads statically
app.use("/uploads/templates", express.static(path.join(__dirname, "uploads/templates")));


// Use the user router for login/register -- NO AUTH
app.use('/api/users', userRoutes);

//All subsequent calls to /api/ will authenticate token
app.use('/api', authenticateToken);

app.use('/api/templates', templateRoutes); // protected


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
