import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import villaRoutes from './routes/villaRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import foodOrderRoutes from './routes/foodOrderRoutes.js';
import foodCartRoutes from './routes/foodCartRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes); 
app.use('/api/equipment', equipmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/rooms', roomRoutes);
app.use('/api/villas', villaRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/food-orders', foodOrderRoutes);
app.use('/api/food-cart', foodCartRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
