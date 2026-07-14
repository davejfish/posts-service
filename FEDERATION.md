# TODO — Stitch users-service + posts-service into one federated graph

Goal: compose both Federation 2 subgraphs behind a gateway and make the graph
navigable **both directions** — `User.posts → [Post]` and `Post.author → User`.

Both services are already valid Federation 2 subgraphs (`ApolloFederationDriver`,
`@key(fields: "id")` on `User` and `Post`). What's missing: cross-graph reference
fields and a composition gateway.

## Current state

|                        | users-service            | posts-service            |
|------------------------|--------------------------|--------------------------|
| Federation driver v2   | ✅                        | ✅                        |
| Entity key `@key(id)`  | ✅ `User`                 | ✅ `Post`                 |
| `@ResolveReference`    | ✅                        | ❌ (add it)               |
| Cross-graph link       | ❌                        | ❌ (only `authorId: string`) |
| Gateway                | ❌ doesn't exist yet      |                          |

## Steps

- [ ] **Distinct ports.** Both `main.ts` read `process.env.PORT` (default 3000).
  - [ ] users-service `.env`: `PORT=3000`
  - [ ] posts-service `.env`: `PORT=3001` (currently lowercase `port=3535` — make it
        uppercase `PORT` so it resolves cross-platform, not just on Windows)
  - [ ] gateway: `4000`

- [ ] **posts-service: make `Post` resolvable as a reference**
  - [ ] Add `findById(id)` to `PostsService`:
    ```ts
    async findById(id: string): Promise<Post | null> {
      return this.prismaService.post.findUnique({ where: { id } });
    }
    ```
  - [ ] Add `@ResolveReference` to `PostsResolver`:
    ```ts
    @ResolveReference()
    resolveReference(ref: { __typename: string; id: string }) {
      return this.postsService.findById(ref.id);
    }
    ```

- [ ] **posts-service: `Post.author → User`**
  - [ ] New `src/posts-service/user.entity.ts` — a stub `User` entity this subgraph references:
    ```ts
    import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
    import { Post } from './posts.entity';

    @ObjectType()
    @Directive('@key(fields: "id")')
    export class User {
      @Field(() => ID)
      id!: string;

      @Field(() => [Post])        // posts-service contributes this field
      posts?: Post[];
    }
    ```
  - [ ] Add `author` resolver to `PostsResolver` (returns a reference, not a full object —
        the gateway hydrates it from users-service):
    ```ts
    @ResolveField(() => User)
    author(@Parent() post: Post) {
      return { __typename: 'User', id: post.authorId };
    }
    ```
  - [ ] Import `ResolveField`, `Parent`, `ResolveReference` from `@nestjs/graphql`.

- [x] **posts-service: contribute `User.posts → [Post]`** ✅ done — `UserPostsResolver` added & registered; served SDL confirms `User @key(id) { posts }`
  - [x] Resolver for the stub `User` type:
    ```ts
    @Resolver(() => User)
    export class UserPostsResolver {
      constructor(private readonly postsService: PostsService) {}

      @ResolveField(() => [Post])
      posts(@Parent() user: User) {
        return this.postsService.getUserPosts(user.id);   // already exists
      }

      @ResolveReference()
      resolveReference(ref: { __typename: string; id: string }) {
        return { id: ref.id };   // stub — users-service fills in the rest
      }
    }
    ```
  - [x] Register `User` and `UserPostsResolver` in `PostsModule` providers.
  - Note: `User` having a `@ResolveReference` in *both* subgraphs is correct — each
    subgraph resolves its own slice. v2 treats key fields as implicitly shareable, so
    `id` in both won't break composition.

- [ ] **users-service: no changes.** Already has `User @key(id)` + `@ResolveReference`;
      it resolves the `author` references posts-service emits.

- [x] **Gateway package** `federation/gateway` ✅ built & verified — standalone tsx app,
      subgraph URLs env-configurable (defaults: users `:3534`, posts `:3535`; gateway `:4000`)
  - [x] `npm i @apollo/gateway @apollo/server graphql` (+ `dotenv`, `tsx`)
  - [x] `src/index.ts`:
    ```ts
    import { ApolloServer } from '@apollo/server';
    import { startStandaloneServer } from '@apollo/server/standalone';
    import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'users', url: 'http://localhost:3000/graphql' },
          { name: 'posts', url: 'http://localhost:3001/graphql' },
        ],
      }),
    });

    const server = new ApolloServer({ gateway });
    const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
    console.log(`🚀 gateway ready at ${url}`);
    ```
  - `IntrospectAndCompose` introspects both live subgraphs at startup — no rover, no
    static supergraph file. (Swap to composed `supergraph.graphql` + Apollo Router for prod.)

- [x] **Run & verify** ✅ confirmed working — both directions resolve through the gateway
      (subgraphs first, then gateway — IntrospectAndCompose composes at boot)
  1. users-service on `:3534`
  2. posts-service on `:3535`
  3. gateway on `:4000` (`cd federation/gateway && npm run dev`)
  - [x] Query `http://localhost:4000/graphql` crossing the boundary both ways:
    ```graphql
    query {
      getUsers { id firstName posts { id content } }
      getPosts { id content author { id email } }
    }
    ```
  - [x] Done — `posts` and `author` both populate.

## Gotchas

- **Restart the gateway** after changing either subgraph's schema — it composes once at boot.
- Both services use `autoSchemaFile` (`src/schema.gql`), regenerated on boot — commit the
  updated `schema.gql` files.
- `@ResolveField` on a code-first type requires the type be a registered provider — make sure
  the posts-side `User` and its resolver are in `PostsModule`.
- Reference resolvers must return the `{ __typename, id }` / `{ id }` shape exactly, not a
  fully-loaded object.
