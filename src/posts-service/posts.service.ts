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

    async getUserPosts(userId: string): Promise<Post[]> {
        const posts = await this.prismaService.post.findMany({
            where: { authorId: userId }
        });
        return posts;
    }
}