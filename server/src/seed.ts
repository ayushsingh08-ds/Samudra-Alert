/* eslint-disable no-console */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model';
import Report from './models/Report.model';
import Alert from './models/Alert.model';
import DeviceToken from './models/DeviceToken.model';
import { env } from './config/env';
import { regionForPoint } from '@samudra/shared';

async function seed() {
  console.log('🌱 Seeding Samudra-Alert database...');

  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Report.deleteMany({}),
    Alert.deleteMany({}),
    DeviceToken.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const users = await User.create([
    { name: 'Admin User', email: 'admin@samudra-alert.in', passwordHash, role: 'admin', region: 'Delhi' },
    { name: 'Meera Moderator', email: 'moderator@samudra-alert.in', passwordHash, role: 'moderator', region: 'Maharashtra' },
    { name: 'Arjun Citizen', email: 'citizen@samudra-alert.in', passwordHash, role: 'citizen', region: 'Assam' },
    { name: 'Kavya Citizen', email: 'kavya@samudra-alert.in', passwordHash, role: 'citizen', region: 'Tamil Nadu' },
  ]);

  const [admin, moderator, citizen1, citizen2] = users;

  const reportSeeds = [
    // [title, category, severity, lat, lng, daysAgo, status]
    ['Brahmaputra crosses danger mark, Guwahati', 'Flood', 9, 26.1445, 91.7362, 0, 'verified'],
    ['Village road submerged, Majuli', 'Flood', 8, 26.95, 94.17, 0, 'pending'],
    ['Embankment breach feared, Dhemaji', 'Flood', 7, 27.4833, 94.5833, 1, 'verified'],
    ['Ganga above warning level, Patna', 'Flood', 8, 25.5941, 85.1376, 1, 'verified'],
    ['Waterlogging blocks hospital road, Muzaffarpur', 'Flood', 6, 26.1209, 85.3647, 2, 'pending'],
    ['Heat wave alert, Prayagraj', 'Heat Wave', 8, 25.4358, 81.8463, 0, 'verified'],
    ['44°C recorded, Lucknow schools shut', 'Heat Wave', 7, 26.8467, 80.9462, 1, 'verified'],
    ['Electricity feeder failure, Kanpur', 'Power Outage', 6, 26.4499, 80.3319, 2, 'pending'],
    ['Unsafe water supply, old city', 'Water Supply', 5, 28.6519, 77.2315, 0, 'pending'],
    ['AQI severe, Anand Vihar', 'Air Quality', 9, 28.6469, 77.3161, 0, 'verified'],
    ['AQI very poor, Rohini', 'Air Quality', 7, 28.7495, 77.0565, 1, 'pending'],
    ['Factory fire in Anaj Mandi', 'Fire', 8, 28.6574, 77.2273, 1, 'verified'],
    ['Building fire doused, Dwarka', 'Fire', 5, 28.5921, 77.046, 3, 'resolved'],
    ['Crash on Delhi-Jaipur highway', 'Road Accident', 7, 28.3503, 76.8134, 0, 'pending'],
    ['Goods train derails near Guntakal', 'Road Closure', 6, 15.1676, 77.3717, 1, 'verified'],
    ['Landslide blocks Jammu-Srinagar highway', 'Landslide', 8, 33.0832, 74.7973, 0, 'verified'],
    ['Cloudburst debris, Kullu', 'Landslide', 6, 31.9578, 77.1095, 2, 'pending'],
    ['Sewer gas leak, Dharavi', 'Gas Leak', 7, 19.0461, 72.8547, 0, 'pending'],
    ['Ammonia leak contained, Vashi', 'Gas Leak', 5, 19.0771, 72.9986, 4, 'resolved'],
    ['Cyclone watch, coastal Odisha', 'Cyclone', 9, 20.2605, 85.8395, 0, 'verified'],
    ['Storm surge warning, Puri', 'Cyclone', 8, 19.8135, 85.8312, 1, 'verified'],
    ['Very heavy rain forecast, Bengaluru', 'Heavy Rain', 6, 12.9716, 77.5946, 0, 'verified'],
    ['Thunderstorm damages crops, Nizamabad', 'Thunderstorm', 5, 18.6725, 78.0941, 1, 'pending'],
    ['Dengue cluster reported, Coimbatore', 'Health Advisory', 6, 11.0168, 76.9558, 1, 'verified'],
    ['Drowning risk flagged, Kovalam', 'Tsunami', 4, 8.4004, 76.9784, 3, 'resolved'],
  ] as const;

  const reporters = [citizen1, citizen2, moderator];

  const reports = await Report.insertMany(
    reportSeeds.map(([title, category, severity, lat, lng, daysAgo, status], i) => {
      const createdAt = new Date(Date.now() - daysAgo * 86400000 - i * 3600000);
      const reporter = reporters[i % reporters.length];
      return {
        title,
        description: `${title}. Verified on ground by community reporters; local authorities informed through the Samudra-Alert app. Residents in the area are advised to follow safety instructions and share updates if conditions change.`,
        category,
        severity,
        region: regionForPoint(lat, lng),
        status,
        images: [],
        location: { type: 'Point', coordinates: [lng, lat] },
        createdBy: reporter._id,
        createdAt,
        updatedAt: createdAt,
        statusHistory: [
          { status: 'pending', updatedBy: reporter._id, updatedAt: createdAt },
          ...(status !== 'pending'
            ? [
                {
                  status: status as 'verified' | 'rejected' | 'resolved',
                  reason:
                    status === 'verified'
                      ? 'Corroborated by multiple community reports'
                      : status === 'resolved'
                        ? 'Situation normalized'
                        : 'Insufficient evidence',
                  updatedBy: moderator._id,
                  updatedAt: new Date(createdAt.getTime() + 45 * 60000),
                },
              ]
            : []),
        ],
      };
    }),
  );

  console.log(`✅ Inserted ${reports.length} reports across ${new Set(reports.map((r) => r.region)).size} regions`);

  await Alert.create([
    {
      title: 'Flood Warning — Kamrup, Assam',
      message:
        'Brahmaputra water level is rising above the danger mark at Guwahati. Residents in low-lying areas should move to relief camps. Emergency helpline: 1079.',
      severity: 'critical',
      category: 'Flood',
      targetArea: {
        center: { type: 'Point', coordinates: [91.7362, 26.1445] },
        radiusKm: 80,
      },
      channels: ['inapp', 'push'],
      status: 'sent',
      sentBy: admin._id,
      deliveryStats: { pushSent: 0, pushFailed: 0 },
    },
    {
      title: 'Severe Air Quality Alert — Delhi NCR',
      message:
        'AQI has crossed 400 in several zones. Children, elderly and those with respiratory conditions should stay indoors; N95 masks recommended outdoors.',
      severity: 'high',
      category: 'Air Quality',
      targetArea: {
        center: { type: 'Point', coordinates: [77.209, 28.6139] },
        radiusKm: 60,
      },
      channels: ['inapp', 'push'],
      status: 'sent',
      sentBy: admin._id,
      deliveryStats: { pushSent: 0, pushFailed: 0 },
    },
    {
      title: 'Heat Wave Advisory — Uttar Pradesh',
      message:
        'Day temperatures expected to touch 44–46°C for the next three days. Avoid outdoor activity between 12–4 pm and stay hydrated.',
      severity: 'medium',
      category: 'Heat Wave',
      targetArea: null,
      channels: ['inapp'],
      status: 'sent',
      sentBy: admin._id,
      deliveryStats: { pushSent: 0, pushFailed: 0 },
    },
  ]);

  console.log('✅ Inserted 3 alerts');
  console.log('\n📋 Demo accounts (password: Password123!)');
  console.log('   admin@samudra-alert.in     (admin)');
  console.log('   moderator@samudra-alert.in (moderator)');
  console.log('   citizen@samudra-alert.in   (citizen)');

  await mongoose.disconnect();
  console.log('🌱 Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
