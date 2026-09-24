const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { mongoUri } = require('./config/env');
const AdminUser = require('./models/AdminUser');
const SiteSetting = require('./models/SiteSetting');
const User = require('./models/User');
const MatrimonialProfile = require('./models/MatrimonialProfile');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@solaimatrimony.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

const DEFAULT_SETTINGS = {
  general: {
    site_name: 'Solai Matrimony',
    tagline: 'Find Your Perfect Life Partner',
    logo_url: '',
    footer_text: 'Solai Matrimony is committed to helping you find the perfect life partner with trust and care.',
  },
  hero: {
    hero_title: 'Find Your Perfect Life Partner',
    hero_subtitle: 'Discover meaningful connections with trusted matrimonial profiles.',
    hero_primary_button: 'Browse Profiles',
    hero_secondary_button: 'Get Started',
  },
  about: {
    about_text: 'Solai Matrimony is a trusted matrimonial service dedicated to bringing families together with care, respect and security.',
  },
  contact: {
    office_name: 'Solai Matrimony Office',
    office_phone: '+91 00000 00000',
    office_email: 'contact@solaimatrimony.com',
    office_address: '123, Marriage Street, Chennai, Tamil Nadu',
  },
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  },
  stats: {
    trusted_profiles: 2500,
    active_members: 1200,
    successful_connections: 950,
    years_of_service: 15,
  },
  content: {
    why_choose_us_title: 'Why Choose Solai Matrimony',
    how_it_works_title: 'How It Works',
    testimonials_title: 'What Our Families Say',
    faq_title: 'Frequently Asked Questions',
  },
};

async function main() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const existingAdmin = await AdminUser.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    await AdminUser.create({
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'superadmin',
    });
    console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  const settingCount = await SiteSetting.countDocuments();
  if (settingCount === 0) {
    const docs = [];
    Object.entries(DEFAULT_SETTINGS).forEach(([group, values]) => {
      Object.entries(values).forEach(([key, value]) => {
        docs.push({ key, group, label: key.split('_').join(' '), value });
      });
    });
    await SiteSetting.insertMany(docs);
    console.log('Default site settings seeded');
  } else {
    console.log('Site settings already present');
  }

  const userCount = await User.countDocuments();
  const profileCount = await MatrimonialProfile.countDocuments();
  console.log(`Users: ${userCount}, Profiles: ${profileCount}`);

  const demoUser = await User.findOne({ email: 'demo@solaimatrimony.com' });
  if (!demoUser) {
    await User.create({
      name: 'Demo User',
      email: 'demo@solaimatrimony.com',
      mobile: '9876543210',
      password: await bcrypt.hash('demo123456', 10),
    });
    console.log('Demo user created: demo@solaimatrimony.com / demo123456');
  }

  await mongoose.disconnect();
  console.log('Seed complete');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});