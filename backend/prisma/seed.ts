/**
 * Seed: Bad Decisions Custom Cycles & Boats (BDCC) — POWERSPORTS vertical.
 *
 * Run with:  npm run db:seed
 *
 * Idempotent: re-running won't duplicate the merchant. Services are only seeded
 * if the merchant has none — to re-seed services, delete them in the dashboard
 * first (or drop the merchant entirely).
 *
 * Prisma v7 adapter pattern (mirrors PrismaService).
 */

import 'dotenv/config';
import { PrismaClient, type QuestionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as never);
const prisma = new PrismaClient({ adapter });

// ── BDCC merchant ──
const BDCC = {
  email: 'billy@baddecisionscustoms.com',
  // Placeholder. Change immediately on first login.
  defaultPassword: 'BDCC-temp-2026!',
  name: 'Bad Decisions Custom Cycles & Boats',
  timezone: 'America/New_York',
  shopHours: {
    mon: { open: '10:00', close: '18:00' },
    tue: { open: '10:00', close: '18:00' },
    wed: { open: '10:00', close: '18:00' },
    thu: { open: '10:00', close: '18:00' },
    fri: { open: '10:00', close: '18:00' },
    // Saturdays + Sundays closed (per the recent hours alignment commit on the main site)
  },
  settings: {
    depositPercent: 0, // No upfront deposit — consult-and-quote model
    address: '354 N 9th St Suite 2, Stroudsburg, PA 18360',
    phone: '+15707304433',
  },
};

interface SeedQuestion {
  question: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
}

interface SeedService {
  name: string;
  description: string;
  category: string;
  durationMins: number;
  priceCents: number; // 0 = quote on consult
  intake: SeedQuestion[];
}

const SERVICES: SeedService[] = [
  {
    name: 'Custom Paint',
    description: 'Candy, flake, murals, airbrush, full repaints. Quoted on consult.',
    category: 'Paint',
    durationMins: 60,
    priceCents: 0,
    intake: [
      {
        question: "What's the scope of the paint job?",
        type: 'RADIO',
        options: ['New build', 'Full repaint', 'Touch-up / spot repair', 'Restoration'],
        required: true,
      },
      {
        question: 'Color or finish you have in mind',
        type: 'TEXT',
      },
      {
        question: 'Design elements (pick any that apply)',
        type: 'CHECKBOX',
        options: ['Solid color', 'Two-tone', 'Candy', 'Flake / metalflake', 'Mural / airbrush', 'Stripes', 'Pinstripe'],
      },
      {
        question: 'Reference photos (Pinterest screenshots, inspiration shots, current state of the bike)',
        type: 'PHOTO_UPLOAD',
      },
      {
        question: 'Anything else we should know?',
        type: 'TEXT',
      },
    ],
  },
  {
    name: 'Powder Coating',
    description: 'Frames, wheels, suspension components, engine parts. Durable finish, hundreds of colors.',
    category: 'Coating',
    durationMins: 30,
    priceCents: 0,
    intake: [
      {
        question: 'Which parts are getting coated?',
        type: 'CHECKBOX',
        options: ['Frame', 'Wheels', 'Suspension', 'Engine / drivetrain parts', 'Brackets / hardware', 'Miscellaneous small parts'],
        required: true,
      },
      {
        question: 'Color preference (or "open to recommendations")',
        type: 'TEXT',
        required: true,
      },
      {
        question: 'Finish',
        type: 'RADIO',
        options: ['Gloss', 'Satin', 'Matte', 'Textured'],
      },
      {
        question: 'Photos of the parts',
        type: 'PHOTO_UPLOAD',
      },
    ],
  },
  {
    name: 'Metal Fabrication',
    description: 'Welding, exhaust work, frame mods, hardtail conversions, sissy bars, brackets, one-off pieces.',
    category: 'Fabrication',
    durationMins: 60,
    priceCents: 0,
    intake: [
      {
        question: 'What kind of fab work?',
        type: 'CHECKBOX',
        options: [
          'Welding / repair',
          'Exhaust',
          'Frame modifications',
          'Hardtail conversion',
          'Sissy bar / bagger work',
          'Brackets / mounts',
          'Other custom piece',
        ],
        required: true,
      },
      {
        question: 'Describe the project (what you want, dimensions if you have them)',
        type: 'TEXT',
        required: true,
      },
      {
        question: 'Reference photos or sketches',
        type: 'PHOTO_UPLOAD',
      },
    ],
  },
  {
    name: 'Motorcycle Repair',
    description: 'All makes, all decades. Diagnostics, tune-ups, top-end rebuilds, electrical, carbs.',
    category: 'Repair',
    durationMins: 90,
    priceCents: 0,
    intake: [
      {
        question: "What's going on with the bike?",
        type: 'TEXT',
        required: true,
      },
      {
        question: 'Is it currently running?',
        type: 'RADIO',
        options: ['Yes', 'Sometimes / intermittently', 'No'],
        required: true,
      },
      {
        question: 'Approximate mileage',
        type: 'TEXT',
      },
      {
        question: 'Any recent service history we should know about?',
        type: 'TEXT',
      },
      {
        question: 'Photos (optional — helpful for diagnosing leaks, damage, etc.)',
        type: 'PHOTO_UPLOAD',
      },
    ],
  },
  {
    name: 'Boat Work',
    description: 'Fiberglass, gel coat, marine audio, outboard / inboard service, detail and restoration.',
    category: 'Marine',
    durationMins: 60,
    priceCents: 0,
    intake: [
      {
        question: 'What kind of work?',
        type: 'CHECKBOX',
        options: ['Fiberglass / gel coat', 'Outboard service', 'Inboard / sterndrive service', 'Marine audio', 'Detail / restoration', 'Other'],
        required: true,
      },
      {
        question: 'Describe the job',
        type: 'TEXT',
        required: true,
      },
      {
        question: 'Photos of the boat / issue',
        type: 'PHOTO_UPLOAD',
      },
    ],
  },
  {
    name: 'Powersports Service',
    description: 'ATV, UTV, side-by-side, snowmobile. Maintenance, performance, and repair.',
    category: 'Powersports',
    durationMins: 60,
    priceCents: 0,
    intake: [
      {
        question: 'What service do you need?',
        type: 'CHECKBOX',
        options: ['Oil change / scheduled maintenance', 'Tune-up', 'Tires', 'Suspension', 'Top-end rebuild', 'Diagnostic', 'Other'],
        required: true,
      },
      {
        question: 'Notes',
        type: 'TEXT',
      },
      {
        question: 'Photos (if helpful)',
        type: 'PHOTO_UPLOAD',
      },
    ],
  },
];

async function main() {
  console.log('▶ Seeding BDCC merchant…');

  const passwordHash = await bcrypt.hash(BDCC.defaultPassword, 12);

  const merchant = await prisma.merchant.upsert({
    where: { email: BDCC.email },
    update: {
      // Don't overwrite password / settings on re-run, but keep name + hours fresh.
      name: BDCC.name,
      timezone: BDCC.timezone,
      shopHours: BDCC.shopHours,
      vertical: 'POWERSPORTS',
    },
    create: {
      email: BDCC.email,
      passwordHash,
      name: BDCC.name,
      timezone: BDCC.timezone,
      shopHours: BDCC.shopHours,
      settings: BDCC.settings,
      vertical: 'POWERSPORTS',
      plan: 'GRANDFATHERED', // BDCCB is one of the grandfathered clients per VR-PLATFORM.md
    },
  });

  console.log(`  merchant: ${merchant.name} (${merchant.id})`);

  // ── Availability rules: Mon–Fri 10am–6pm, weekends closed ──
  // 0=Sun … 6=Sat
  const HOURS: { dayOfWeek: number; startTime: string; endTime: string; isBlocked: boolean }[] = [
    { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isBlocked: true },  // Sun closed
    { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isBlocked: false },
    { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isBlocked: false },
    { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isBlocked: false },
    { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isBlocked: false },
    { dayOfWeek: 5, startTime: '10:00', endTime: '18:00', isBlocked: false },
    { dayOfWeek: 6, startTime: '10:00', endTime: '18:00', isBlocked: true },  // Sat closed
  ];

  for (const rule of HOURS) {
    await prisma.availabilityRule.upsert({
      where: { merchantId_dayOfWeek: { merchantId: merchant.id, dayOfWeek: rule.dayOfWeek } },
      update: rule,
      create: { ...rule, merchantId: merchant.id },
    });
  }
  console.log('  availability rules: Mon-Fri 10am-6pm, weekends closed');

  // ── Services + intake questions ──
  const existing = await prisma.service.findMany({ where: { merchantId: merchant.id } });
  if (existing.length > 0) {
    console.log(`  services: skipped (${existing.length} already exist — delete them in the dashboard to re-seed)`);
  } else {
    for (const svc of SERVICES) {
      const service = await prisma.service.create({
        data: {
          merchantId: merchant.id,
          name: svc.name,
          description: svc.description,
          category: svc.category,
          durationMins: svc.durationMins,
          priceCents: svc.priceCents,
        },
      });

      for (let i = 0; i < svc.intake.length; i++) {
        const q = svc.intake[i];
        await prisma.intakeQuestion.create({
          data: {
            serviceId: service.id,
            question: q.question,
            type: q.type,
            options: q.options ?? undefined,
            required: q.required ?? false,
            sortOrder: i,
          },
        });
      }
      console.log(`  service: ${svc.name} (+ ${svc.intake.length} intake questions)`);
    }
  }

  console.log('\n✓ BDCC seed complete.');
  console.log(`  Login:    ${BDCC.email}`);
  console.log(`  Password: ${BDCC.defaultPassword}  ← change after first login`);
  console.log(`  Vertical: POWERSPORTS`);
  console.log(`  Booking URL: https://<your-whos-next-frontend>/book/${merchant.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
