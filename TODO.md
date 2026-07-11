# TODO — Posts Service Seeding

Goal: seed the `posts` table with `authorId` values that reference real users in
the **users-service**. Blocker: `User.id` is `gen_random_uuid()`, generated at
insert time, so IDs don't exist until users are created — can't hardcode them blindly.

## Steps

- [ ] **Review users-service** to decide the seeding approach
  - Check for an existing user seed / how users get created
  - Decide whether user IDs can be made fixed/deterministic
- [ ] **Decide seeding strategy** (see options below)
- [ ] Implement the chosen option
- [ ] Build the posts seed referencing the chosen `authorId` values
- [ ] Wire it to the existing `prisma db seed` script and run it

## Options

### Option 1 — Fixed / deterministic UUID fixtures (recommended)
Give users known, hardcoded UUIDs in the users-service seed (explicit `id` values
override the `gen_random_uuid()` default). Share those same IDs with the posts seed.
- ✅ Simple, reproducible, no runtime lookups, services stay independent
- ✅ Predictable data for testing the federated `Post.author` join later

### Option 2 — Fetch user IDs at posts-seed runtime
Keep users' IDs random; have the posts seed look them up before inserting.
- Via users **GraphQL API** (`getUsers { id }`) — federation-idiomatic, no DB coupling
- Or **SELECT** directly from the users DB — quicker but couples the two databases
- ⚠️ Requires users-service to be seeded + running first

### Option 3 — One combined seed script
Create users, capture returned IDs, then create posts referencing them from a single
script. Only works if both DBs are seeded from one place — not typical for independent
services.

## Decision
_TBD — pending users-service review._
