import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Post } from './posts.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => [Post])          // posts-service contributes this field
  posts?: Post[];
}
