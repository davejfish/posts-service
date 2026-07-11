import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma-service/prisma.service";
import { Post } from "./posts.entity";



@Injectable()
export class PostsService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(): Promise<Post[]> {
        return await this.prismaService.post.findMany();
    }
}