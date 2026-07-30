import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { env } from '../config/env';

// Only the new CYBER Section A entries for both batches
const newJuries = [
  { batch: '24-28', year: '3', dep: 'CYBER', sec: 'A' }, // 3rd Year
];

const seedCyber = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB Connected for CYBER Seeder');

    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('sece@2026', salt);

    const usersToInsert: any[] = [];

    for (const item of newJuries) {
      const batchCode = item.batch.replace('-', ''); // "2327" or "2428"
      const suffix = item.sec ? `_${item.sec}` : '';
      const baseId = `${batchCode}_${item.dep}${suffix}`; // e.g. "2327_CYBER_A"

      // Check if already exists to avoid duplicates
      const existingAlumni = await User.findOne({ juryId: `AJ${baseId}` });
      const existingIndustry = await User.findOne({ juryId: `IJ${baseId}` });
      const existingFaculty = await User.findOne({ juryId: `FJ${baseId}` });

      if (!existingAlumni) {
        usersToInsert.push({
          name: `Alumni Jury ${item.dep} ${item.sec}`.trim(),
          juryId: `AJ${baseId}`,
          password: commonPasswordHash,
          role: 'alumni_jury',
          year: item.year,
          department: item.dep,
          section: item.sec || undefined,
        });
      } else {
        console.log(`⚠️  Skipped (already exists): AJ${baseId}`);
      }

      if (!existingIndustry) {
        usersToInsert.push({
          name: `Industry Jury ${item.dep} ${item.sec}`.trim(),
          juryId: `IJ${baseId}`,
          password: commonPasswordHash,
          role: 'industry_jury',
          year: item.year,
          department: item.dep,
          section: item.sec || undefined,
        });
      } else {
        console.log(`⚠️  Skipped (already exists): IJ${baseId}`);
      }

      if (!existingFaculty) {
        usersToInsert.push({
          name: `Faculty Jury ${item.dep} ${item.sec}`.trim(),
          juryId: `FJ${baseId}`,
          password: commonPasswordHash,
          role: 'faculty_jury',
          year: item.year,
          department: item.dep,
          section: item.sec || undefined,
        });
      } else {
        console.log(`⚠️  Skipped (already exists): FJ${baseId}`);
      }
    }

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert);
      console.log(`\n✅ Inserted ${usersToInsert.length} new CYBER jury accounts:`);
      usersToInsert.forEach(u => console.log(`   → ${u.juryId}  (${u.role})`));
    } else {
      console.log('\n⚠️  All CYBER jury accounts already exist. Nothing inserted.');
    }

    console.log('\nCommon password: sece@2026');
    process.exit(0);
  } catch (error) {
    console.error('Error running CYBER seeder:', error);
    process.exit(1);
  }
};

seedCyber();
