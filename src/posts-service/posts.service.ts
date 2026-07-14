import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma-service/prisma.service";
import { Post } from "./posts.entity";

@Injectable()
export class PostsService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(): Promise<Post[]> {
        const posts = await this.prismaService.post.findMany();
        return posts;
    }

    async getPostById(postId: string): Promise<Post | null> {
        const post = await this.prismaService.post.findUnique({
            where: { id: postId }
        });
        return post;
    }

    async getUserPosts(userId: string): Promise<Post[]> {
        const posts = await this.prismaService.post.findMany({
            where: { authorId: userId }
        });
        return posts;
    }

    
}