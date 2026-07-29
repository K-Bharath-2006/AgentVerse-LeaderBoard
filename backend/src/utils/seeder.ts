import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { env } from '../config/env';

const rawJuries = [
  // Batch 23-27 (Year 4 / 4th Year)
  { batch: '23-27', year: '4', dep: 'AIDS', sec: 'A' },
  { batch: '23-27', year: '4', dep: 'AIDS', sec: 'B' },
  { batch: '23-27', year: '4', dep: 'AIDS', sec: 'C' },
  { batch: '23-27', year: '4', dep: 'AIML', sec: 'A' },
  { batch: '23-27', year: '4', dep: 'AIML', sec: 'B' },
  { batch: '23-27', year: '4', dep: 'CCE', sec: '' },
  { batch: '23-27', year: '4', dep: 'CSBS', sec: '' },
  { batch: '23-27', year: '4', dep: 'CSE', sec: 'A' },
  { batch: '23-27', year: '4', dep: 'CSE', sec: 'B' },
  { batch: '23-27', year: '4', dep: 'CSE', sec: 'C' },
  { batch: '23-27', year: '4', dep: 'ECE', sec: 'A' },
  { batch: '23-27', year: '4', dep: 'ECE', sec: 'B' },
  { batch: '23-27', year: '4', dep: 'ECE', sec: 'C' },
  { batch: '23-27', year: '4', dep: 'EEE', sec: '' },
  { batch: '23-27', year: '4', dep: 'IT', sec: '' },
  { batch: '23-27', year: '4', dep: 'MECH', sec: '' },

  // Batch 24-28 (Year 3 / 3rd Year)
  { batch: '24-28', year: '3', dep: 'AIDS', sec: 'A' },
  { batch: '24-28', year: '3', dep: 'AIDS', sec: 'B' },
  { batch: '24-28', year: '3', dep: 'AIDS', sec: 'C' },
  { batch: '24-28', year: '3', dep: 'AIDS', sec: 'D' },
  { batch: '24-28', year: '3', dep: 'AIML', sec: 'A' },
  { batch: '24-28', year: '3', dep: 'AIML', sec: 'B' },
  { batch: '24-28', year: '3', dep: 'CCE', sec: '' },
  { batch: '24-28', year: '3', dep: 'CSBS', sec: '' },
  { batch: '24-28', year: '3', dep: 'CSE', sec: 'A' },
  { batch: '24-28', year: '3', dep: 'CSE', sec: 'B' },
  { batch: '24-28', year: '3', dep: 'CSE', sec: 'C' },
  { batch: '24-28', year: '3', dep: 'CSE', sec: 'D' },
  { batch: '24-28', year: '3', dep: 'ECE', sec: 'A' },
  { batch: '24-28', year: '3', dep: 'ECE', sec: 'B' },
  { batch: '24-28', year: '3', dep: 'ECE', sec: 'C' },
  { batch: '24-28', year: '3', dep: 'EEE', sec: '' },
  { batch: '24-28', year: '3', dep: 'IT', sec: '' },
  { batch: '24-28', year: '3', dep: 'MECH', sec: '' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB Connected for Production Seeding');

    const db = mongoose.connection;
    // Clear all existing databases
    await db.collection('teams').deleteMany({});
    await db.collection('agents').deleteMany({});
    await db.collection('juryscores').deleteMany({});
    await db.collection('events').deleteMany({});
    await User.deleteMany({}); // Clear existing users

    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('sece@2026', salt);

    const usersToInsert: any[] = [
      // Production Admin
      {
        name: 'Admin',
        email: 'admin@sece.ac.in',
        password: commonPasswordHash,
        role: 'admin',
      }
    ];

    for (const item of rawJuries) {
      const batchCode = item.batch.replace('-', ''); // "2327" or "2428"
      const suffix = item.sec ? `_${item.sec}` : '';
      const baseId = `${batchCode}_${item.dep}${suffix}`; // e.g. "2327_AIDS_A" or "2327_CCE"

      // 1. Alumni Jury
      usersToInsert.push({
        name: `Alumni Jury ${item.dep} ${item.sec}`.trim(),
        juryId: `AJ${baseId}`,
        password: commonPasswordHash,
        role: 'alumni_jury',
        year: item.year,
        department: item.dep,
        section: item.sec || undefined,
      });

      // 2. Industry Jury
      usersToInsert.push({
        name: `Industry Jury ${item.dep} ${item.sec}`.trim(),
        juryId: `IJ${baseId}`,
        password: commonPasswordHash,
        role: 'industry_jury',
        year: item.year,
        department: item.dep,
        section: item.sec || undefined,
      });

      // 3. Faculty Jury
      usersToInsert.push({
        name: `Faculty Jury ${item.dep} ${item.sec}`.trim(),
        juryId: `FJ${baseId}`,
        password: commonPasswordHash,
        role: 'faculty_jury',
        year: item.year,
        department: item.dep,
        section: item.sec || undefined,
      });
    }

    await User.insertMany(usersToInsert);
    console.log(`\n🎉 Seeded Admin and ${usersToInsert.length - 1} Jury evaluator accounts successfully!`);
    console.log('Admin account: admin@sece.ac.in');
    console.log('Common password: sece@2026');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
