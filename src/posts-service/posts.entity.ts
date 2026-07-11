import { Directive, Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";


@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  title!: string | null;

  @Field()
  content!: string;

  @Field()
  authorId!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt!: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  deletedAt!: Date | null;
}