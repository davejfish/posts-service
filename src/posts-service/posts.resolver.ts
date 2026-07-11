import { Resolver, Query } from "@nestjs/graphql";
import { Post } from "./posts.entity";
import { PostsService } from "./posts.service";



@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}
    
    @Query(() => [Post])
    async getPosts(): Promise<Post[]> {
        return this.postsService.findAll();
    }
}
