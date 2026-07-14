import { Parent, ResolveField, ResolveReference, Resolver } from "@nestjs/graphql";
import { User } from "./user.entity";
import { Post } from "./posts.entity";
import { PostsService } from "./posts.service";


// Contributes the `posts` field onto the User entity. The data lives in this
// subgraph (Post.authorId), so federation routes User.posts here at query time.
@Resolver(() => User)
export class UserPostsResolver {
    constructor(private readonly postsService: PostsService) {}

    @ResolveField(() => [Post])
    posts(@Parent() user: User): Promise<Post[]> {
        return this.postsService.getUserPosts(user.id);
    }

    // Stub: the gateway hands us a User reference; users-service resolves the rest.
    @ResolveReference()
    resolveReference(ref: { __typename: string; id: string }): { id: string } {
        return { id: ref.id };
    }
}
