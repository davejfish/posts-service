import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsResolver } from "./posts.resolver";
import { UserPostsResolver } from "./user-posts.resolver";


@Module({
  imports: [],
  providers: [PostsService, PostsResolver, UserPostsResolver],
  exports: [PostsService],
})
export class PostsModule {}