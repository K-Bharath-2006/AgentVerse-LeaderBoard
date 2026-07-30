import mongoose from 'mongoose';
import { Event } from '../models/Event.model';
import { env } from '../config/env';

const updateTarget = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB Connected for Event Target Update');
    const result = await Event.updateMany({}, { $set: { targetAgents: 3000 } });
    console.log(`Updated ${result.modifiedCount} event documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating target agents:', error);
    process.exit(1);
  }
};

updateTarget();
