import { Post } from "../entities/post.entities";
import { Resolvers } from "../generated/resolvers-types";

const postResolvers: Resolvers = {
  Query: {
    async post(_, { id }, { data }) {
      const singlePost = await data
        .createQueryBuilder()
        .select("p")
        .from(Post, "p")
        .where("p.id = :id", { id: id })
        .getOne();
      if (singlePost) return { data: singlePost };
      else return { error: "No Post Exist with the specified ID" };
    },
    async posts(_, __, { data }) {
      const allPost = await data
        .createQueryBuilder()
        .select("post")
        .from(Post, "post")
        .getMany();

      return allPost;
    },
  },
  Mutation: {
    async createPost(_, { input }, { data }) {
      if (!input.title || !input?.content) {
        return { error: "Kindly fill in all fields!" };
      }
      try {
        const createdPost = await data
          .createQueryBuilder()
          .insert()
          .into(Post)
          .values(input)
          .returning("*")
          .execute();
        return { data: createdPost.generatedMaps[0] };
      } catch (err) {
        return { error: "unable to perform operation" };
      }
    },
    async deletePost(_, { id }, { data }) {
      if (!id) return false;
      try {
        const deletePost = await data
          .createQueryBuilder()
          .delete()
          .from(Post)
          .where("id = :id", { id })
          .execute();
        return deletePost.affected ? deletePost.affected > 0 : false;
      } catch (e) {
        return false;
      }
    },
    async updatePost(_, { id, input }, { data }) {
      if (!id || !input) return { error: "Insufficient Paramaters" };
      try {
        const updatePost = await data
          .createQueryBuilder()
          .update(Post)
          .set(input)
          .where("id = :id", { id })
          .returning("*")
          .execute();
        return updatePost.affected && updatePost.affected > 0
          ? { data: updatePost.raw[0] }
          : { error: "unable to update post" };
      } catch (err: any) {
        return { error: "Unable to perform update operation at this time!" };
      }
    },
  },
};

export { postResolvers };

/* import {
  Resolver,
  Mutation,
  Ctx,
  Args,
  ArgsType,
  Field,
  Query,
  ID,
} from "type-graphql";
import { Post } from "../entities/post.entities";
import { MyContext } from "../globalTypes";

import { AppDataSource } from "src";

const PostRepository = AppDataSource.getRepository(Post);

@ArgsType()
class QueryInput {
  @Field(() => ID, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  title?: string;
}

@ArgsType()
class CreatePostInput {
  @Field(() => String!)
  title!: string;
}

@Resolver()
export class PostResolver {
  @Mutation(() => Post)
  async createPost(
    @Args(() => CreatePostInput) { title }: CreatePostInput
  ): Promise<Post> {
    const post =  PostRepository.create({ title });
    return post;
  }

  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    const posts = await em.find(Post, {});
    return posts;
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Ctx() { em }: MyContext,
    @Args() { id }: QueryInput
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Ctx() { em }: MyContext,
    @Args() { id, title }: QueryInput
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (post && typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Ctx() { em }: MyContext,
    @Args() { id }: QueryInput
  ): Promise<boolean> {
    const deletePost = await em.nativeDelete(Post, { id });
    if (typeof deletePost !== "number") {
      return false;
    }
    return true;
  }
}
 */
