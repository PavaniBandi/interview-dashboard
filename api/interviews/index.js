import mongoose from 'mongoose';
import Interview from '../../server/models/Interview.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export default async (req, res) => {
  await connectDB();
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const interviews = await Interview.find().sort({ createdAt: -1 });
      res.status(200).json(interviews);
    } else if (req.method === 'POST') {
      const { interviews } = req.body;
      if (interviews && Array.isArray(interviews)) {
        // Bulk insert
        const createdInterviews = await Interview.insertMany(interviews);
        res.status(201).json(createdInterviews);
      } else {
        // Single insert
        const interview = new Interview(req.body);
        await interview.save();
        res.status(201).json(interview);
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
