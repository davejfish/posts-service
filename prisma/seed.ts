import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// users-service GraphQL endpoint. Must be seeded + running first.
const USERS_SERVICE_URL =
  process.env.USERS_SERVICE_URL ?? 'http://localhost:3534/graphql';

// How many posts to create per user.
const POSTS_PER_USER = 3;

// A pool of sample post bodies — one is picked per post so the seed data looks varied.
const SAMPLE_CONTENT = [
  'Just shipped a new feature — federation is finally clicking for me.',
  'Hot take: code-first GraphQL schemas age better than SDL-first ones.',
  'Spent the morning debugging a subgraph composition error. Restart the gateway!',
  'Reminder to self: always commit the generated schema.gql.',
  'Postgres uuid defaults are great until you try to seed cross-service data.',
  'Coffee count today: 4. Bugs fixed: 3. Net positive.',
  'TIL @ResolveReference resolvers must return just the { __typename, id } shape.',
  'Weekend project: wiring a gateway over two Nest subgraphs. So far so good.',
  'Nothing beats the feeling of a green CI run on a Friday afternoon.',
];

interface SeedUser {
  id: string;
}

async function fetchUserIds(): Promise<string[]> {
  const res = await fetch(USERS_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ getUsers { id } }' }),
  });

  if (!res.ok) {
    throw new Error(
      `users-service returned ${res.status} ${res.statusText} — is it seeded and running at ${USERS_SERVICE_URL}?`,
    );
  }

  const body = (await res.json()) as {
    data?: { getUsers?: SeedUser[] };
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new Error(
      `users-service GraphQL error: ${body.errors.map((e) => e.message).join('; ')}`,
    );
  }

  const users = body.data?.getUsers ?? [];
  return users.map((u) => u.id);
}

async function main() {
  console.log(`🔎 Fetching user IDs from ${USERS_SERVICE_URL} ...`);
  const userIds = await fetchUserIds();

  if (userIds.length === 0) {
    throw new Error(
      'users-service returned no users — seed the users-service first.',
    );
  }
  console.log(`✅ Found ${userIds.length} user(s).`);

  // Start from a clean slate so re-running the seed is idempotent.
  const deleted = await prisma.post.deleteMany();
  if (deleted.count > 0) {
    console.log(`🧹 Cleared ${deleted.count} existing post(s).`);
  }

  const data = userIds.flatMap((authorId) =>
    Array.from({ length: POSTS_PER_USER }, (_, i) => ({
      authorId,
      content: SAMPLE_CONTENT[(userIds.indexOf(authorId) * POSTS_PER_USER + i) % SAMPLE_CONTENT.length],
    })),
  );

  const created = await prisma.post.createMany({ data });
  console.log(
    `🌱 Created ${created.count} post(s) — ${POSTS_PER_USER} per user across ${userIds.length} user(s).`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
