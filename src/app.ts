import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import inviteRoutes from './routes/invites';
import orgRoutes from "./routes/org";
import { errorHandler } from "./middleware/errorHandler";
import leaveTypeRoutes from './routes/leaveTypes';
import holidayRoutes from './routes/holiday';
import leaveRoutes from './routes/leave';
import { allowedOrigins } from './middleware/authMiddleware';

dotenv.config();
const app = express();

app.use(cors({
   origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/org`, orgRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/invites`, inviteRoutes);
app.use(`${API_PREFIX}/leave-types`, leaveTypeRoutes);
app.use(`${API_PREFIX}/leaves`, leaveRoutes);
app.use(`${API_PREFIX}/holidays`, holidayRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
