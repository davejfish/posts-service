import { Resolver, Query, Args, ResolveReference, ResolveField, Parent } from "@nestjs/graphql";
import { Post } from "./posts.entity";
import { PostsService } from "./posts.service";
import { User } from "./user.entity";



@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}
    
    @Query(() => [Post])
    async getPosts(): Promise<Post[]> {
        return this.postsService.findAll();
    }

    @Query(() => Post, { nullable: true })
    async getPostById(@Args('postId') postId: string): Promise<Post | null> {
        return this.postsService.getPostById(postId);
    }

    @Query(() => [Post])
    async getUserPosts(@Args('userId') userId: string): Promise<Post[]> {
        return this.postsService.getUserPosts(userId);
    }

    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }): Promise<Post | null> {
        return this.postsService.getPostById(reference.id);
    }

    @ResolveField(() => User)
    author(@Parent() post: Post) {
        return { __typename: 'User', id: post.authorId };
}

}
