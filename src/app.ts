import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import inviteRoutes from './routes/invites';
import orgRoutes from "./routes/org";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/org", orgRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/invites', inviteRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
