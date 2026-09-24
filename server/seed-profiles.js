const profiles = [
  { name: 'Arun Kumar', gender: 'male', age: 29, maritalStatus: 'single', height: "5'10\"", education: 'B.E Mechanical', occupation: 'Software Engineer', salary: '8 LPA', location: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Naidu', about: 'A caring and family-oriented software engineer from Chennai who loves music and travel.', partnerExpectations: 'Looking for a caring and understanding life partner.', status: 'published', isFeatured: true },
  { name: 'Divya Lakshmi', gender: 'female', age: 26, maritalStatus: 'single', height: "5'5\"", education: 'M.Sc Psychology', occupation: 'HR Manager', salary: '6 LPA', location: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', religion: 'Hindu', community: 'Gounder', about: 'Cheerful HR professional based in Coimbatore. Passionate about reading and cooking.', partnerExpectations: 'Seeking an honest and ambitious partner.', status: 'published', isFeatured: true },
  { name: 'Ravi Shankar', gender: 'male', age: 32, maritalStatus: 'married', height: "5'9\"", education: 'MBA Finance', occupation: 'Bank Manager', salary: '12 LPA', location: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Iyengar', about: 'Bank manager with a calm personality and strong family values.', partnerExpectations: '', status: 'published' },
  { name: 'Priya Raman', gender: 'female', age: 27, maritalStatus: 'single', height: "5'4\"", education: 'BDS', occupation: 'Dentist', salary: '10 LPA', location: 'Salem', district: 'Salem', state: 'Tamil Nadu', religion: 'Hindu', community: 'Mudaliar', about: 'Dentist with a gentle nature, enjoys classical dance and helping the community.', partnerExpectations: 'Looking for a professionally settled partner with a good family background.', status: 'published', isFeatured: true },
  { name: 'Suresh Babu', gender: 'male', age: 34, maritalStatus: 'divorced', height: "5'11\"", education: 'MCA', occupation: 'IT Consultant', salary: '15 LPA', location: 'Bangalore', district: 'Bangalore', state: 'Karnataka', religion: 'Hindu', community: 'Reddy', about: 'Senior IT consultant, understanding and mature. Values honesty and trust.', partnerExpectations: 'Seeking a mature and understanding partner.', status: 'published' },
  { name: 'Anitha Devi', gender: 'female', age: 30, maritalStatus: 'married', height: "5'6\"", education: 'BE ECE', occupation: 'Project Manager', salary: '14 LPA', location: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', religion: 'Hindu', community: 'Vysya', about: 'Project manager at a leading software company, settled in Hyderabad.', partnerExpectations: '', status: 'published' },
  { name: 'Karthik Raja', gender: 'male', age: 28, maritalStatus: 'single', height: "5'8\"", education: 'BCom', occupation: 'Business Owner', salary: '20 LPA', location: 'Tiruchirappalli', district: 'Trichy', state: 'Tamil Nadu', religion: 'Hindu', community: 'Chettiar', about: 'Owns a family textile business in Trichy. Traditional and values family.', partnerExpectations: 'Looking for a traditional and homely partner.', status: 'published' },
  { name: 'Meena Kumari', gender: 'female', age: 25, maritalStatus: 'single', height: "5'3\"", education: 'B.Sc Nursing', occupation: 'Staff Nurse', salary: '5 LPA', location: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', religion: 'Christian', community: '', about: 'Dedicated nurse at a private hospital in Vellore. Kind and compassionate.', partnerExpectations: 'Seeking a kind, respectful and employed partner.', status: 'published' },
  { name: 'Vignesh', gender: 'male', age: 31, maritalStatus: 'widowed', height: "5'9\"", education: 'BE Civil', occupation: 'Civil Engineer', salary: '9 LPA', location: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Naidu', about: 'Civil engineer working on urban infrastructure projects. Supportive of the family.', partnerExpectations: 'Seeking a caring partner.', status: 'published' },
  { name: 'Lakshmi Narayanan', gender: 'female', age: 29, maritalStatus: 'single', height: "5'7\"", education: 'M.Sc Computer Science', occupation: 'Software Developer', salary: '11 LPA', location: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Iyer', about: 'Software developer and classical musician. Loves art and technology.', partnerExpectations: 'Looking for a kind and intellectually curious partner.', status: 'featured', isFeatured: true },
  { name: 'Balaji Sundar', gender: 'male', age: 27, maritalStatus: 'single', height: "5'11\"", education: 'MBBS', occupation: 'Doctor', salary: '18 LPA', location: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Brahmin', about: 'Young doctor serving at a city hospital, with a passion for running marathons.', partnerExpectations: 'Looking for a compassionate partner who shares similar values.', status: 'featured', isFeatured: true },
  { name: 'Kavitha R', gender: 'female', age: 33, maritalStatus: 'divorced', height: "5'5\"", education: 'MBA Marketing', occupation: 'Marketing Head', salary: '16 LPA', location: 'Bangalore', district: 'Bangalore', state: 'Karnataka', religion: 'Hindu', community: 'Iyengar', about: 'Marketing head at a consumer goods company. Independent and progressive.', partnerExpectations: 'Seeking a secure and supportive partner.', status: 'published' },
  { name: 'Dinesh Kumar', gender: 'male', age: 30, maritalStatus: 'single', height: "5'7\"", education: 'Diploma Mechanical', occupation: 'Plant Supervisor', salary: '7 LPA', location: 'Erode', district: 'Erode', state: 'Tamil Nadu', religion: 'Hindu', community: 'Gounder', about: 'Plant supervisor in an engineering company in Erode.', partnerExpectations: 'Looking for a simple and loving partner.', status: 'draft' },
  { name: 'Sneha Varma', gender: 'female', age: 24, maritalStatus: 'single', height: "5'4\"", education: 'BDS', occupation: 'Dentist', salary: '8 LPA', location: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', religion: 'Hindu', community: 'Vysya', about: 'Young dentist and a classical dancer.', partnerExpectations: 'Seeking a caring partner.', status: 'blocked' },
];

const mongoose = require('mongoose');
require('dotenv').config();
const { mongoUri } = require('./config/env');
const MatrimonialProfile = require('./models/MatrimonialProfile');

(async () => {
  await mongoose.connect(mongoUri);
  for (const p of profiles) {
    const daysAgo = Math.floor(Math.random() * 20);
    const randomId = `SL${Math.floor(Math.random() * 900000) + 100000}`;
    await MatrimonialProfile.create({
      ...p,
      profileId: randomId,
      age: p.age,
      publishedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      views: Math.floor(Math.random() * 300),
    });
  }
  console.log('Sample profiles seeded:', profiles.length);
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });