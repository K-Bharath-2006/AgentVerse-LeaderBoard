import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { env } from '../config/env';

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    const db = mongoose.connection;
    await db.collection('teams').deleteMany({});
    await db.collection('agents').deleteMany({});
    await db.collection('juryscores').deleteMany({});
    await db.collection('events').deleteMany({});
    await User.deleteMany(); // Clear existing users

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const juryPassword = await bcrypt.hash('jury123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const usersToInsert = [
      // Admin
      {
        name: 'Admin',
        email: 'admin@sece.ac.in',
        password: adminPassword,
        role: 'admin',
      },
      // Juries
      {
        name: 'Faculty Jury',
        juryId: 'FAC100',
        password: juryPassword,
        role: 'faculty_jury',
      },
      {
        name: 'Alumni Jury',
        juryId: 'ALU100',
        password: juryPassword,
        role: 'alumni_jury',
      },
      {
        name: 'Industry Jury',
        juryId: 'IND100',
        password: juryPassword,
        role: 'industry_jury',
      },
      // Students
      {
        name: 'Student One',
        email: 'student1@sece.ac.in',
        password: studentPassword,
        role: 'student',
        rollNumber: '21CS001',
        year: '3',
        department: 'CSE',
        section: 'A',
      },
      {
        name: 'Student Two',
        email: 'student2@sece.ac.in',
        password: studentPassword,
        role: 'student',
        rollNumber: '21CS002',
        year: '3',
        department: 'CSE',
        section: 'A',
      },
      {
        name: 'Student Three',
        email: 'student3@sece.ac.in',
        password: studentPassword,
        role: 'student',
        rollNumber: '21CS003',
        year: '3',
        department: 'CSE',
        section: 'B',
      },
      {
        name: 'Student Four',
        email: 'student4@sece.ac.in',
        password: studentPassword,
        role: 'student',
        rollNumber: '21IT001',
        year: '3',
        department: 'IT',
        section: 'A',
      },
      {
        name: 'Student Five',
        email: 'student5@sece.ac.in',
        password: studentPassword,
        role: 'student',
        rollNumber: '21IT002',
        year: '3',
        department: 'IT',
        section: 'B',
      }
    ];

    await User.insertMany(usersToInsert);
    console.log('Database seeded successfully');
    
    console.log('\n--- Credentials ---');
    console.log('Admin: admin@sece.ac.in / admin123');
    console.log('Faculty Jury: FAC100 / jury123');
    console.log('Alumni Jury: ALU100 / jury123');
    console.log('Industry Jury: IND100 / jury123');
    console.log('Student: student1@sece.ac.in / student123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
