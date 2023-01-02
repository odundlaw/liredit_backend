import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";
import { User } from "../entities/user.entities";
import { Resolvers } from "../generated/resolvers-types";

const userResolver: Resolvers = {
  Query: {
    async me(_, __, { req, data }) {
      if (!req.session.user) {
        return null;
      }
      const user = await data
        .createQueryBuilder()
        .select("u")
        .from(User, "u")
        .where("u.id = :id", { id: req.session.user.id })
        .getOne();
      return user;
    },
    async userById(_, { id }, { data }) {
      if (!id) return { error: "insufficient parameters!" };
      try {
        const user = await data
          .createQueryBuilder()
          .select("user")
          .from(User, "user")
          .where("user.id = :id", { id })
          .getOne();
        return user
          ? { data: user }
          : { error: "No user with the specified Id" };
      } catch (err) {
        return { error: "unable to perform operation at this time!" };
      }
    },
    async userByEmailOrUsername(_, { input }, { data }) {
      if (!input) return { error: "insufficient Parameters!" };
      try {
        const user = await data
          .createQueryBuilder()
          .select("user")
          .from(User, "user")
          .where("user.email = :email", { email: input })
          .orWhere("user.username = :username", { username: input })
          .getOne();
        return user
          ? { data: user }
          : { error: "No user with the specified details found" };
      } catch (err) {
        return { error: "Unable to perform operation try again!" };
      }
    },
  },
  Mutation: {
    logout(_, __, { req, res }) {
      if (req.session.user) {
        res.clearCookie(COOKIE_NAME);
        return new Promise((resolve) =>
          req.session.destroy((err: unknown) => {
            if (err) return resolve(false);
            return resolve(true);
          })
        );
      }else {
        return true
      }
    },
    async login(_, { input }, { data, req }) {
      if (!input.username || !input.password) {
        return { error: "Insufficient Parameters passed" };
      }
      try {
        const getUser = await data
          .createQueryBuilder()
          .select("user")
          .from(User, "user")
          .where("user.email = :email", { email: input.username })
          .orWhere("user.username = :username", { username: input.username })
          .getOne();
        if (!getUser) return { error: "Invalid login Details!" };

        const verifyPass = await argon2.verify(
          getUser.password,
          input.password
        );
        if (!verifyPass) {
          return { error: "Wrong login details!" };
        }
        req.session.user = { username: getUser.username, id: getUser.id };
        console.log(req.session.id);
        return { data: getUser };
      } catch (err: any) {
        return { error: "Unable to Perform Operation at this time" };
      }
    },
    async createUser(_, { input }, { data }) {
      if (!data) return { error: "Insufficient Parameters" };
      try {
        const findUser = await data
          .getRepository(User)
          .findOne({ where: { email: input.email } });
        if (
          findUser &&
          findUser.username.toLowerCase() === input.username.toLowerCase()
        ) {
          return {
            error: "An account with the username or email already exists",
          };
        }
        const hashedPassword = await argon2.hash(input.password);
        const copiedUser = { ...input, password: hashedPassword };
        const createdUser = await data
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(copiedUser)
          .returning("*")
          .execute();
        return { data: createdUser.raw[0] };
      } catch (err: any) {
        return { error: "unable to perform operation" };
      }
    },

    async updateUser(_, { input, updateRef }, { data }) {
      if (!input || !updateRef) return { error: "insufficient parameters!" };
      try {
        const where = {} as { id?: number; email?: string };
        if (typeof updateRef === "number") {
          where.id = updateRef;
        } else if (updateRef.includes("@") || typeof updateRef === "string") {
          where.email = updateRef;
        } else return { error: "Paramater type is invalid" };

        const updateUser = data.createQueryBuilder().update(User).set(input);

        if (where.id !== undefined) {
          updateUser.where("id = :id", { id: where.id });
        } else if (where.email) {
          updateUser.where("email = :email", { email: where.email });
        } else return { error: "Insufficient Paramaters passed try again!" };

        const updated = await updateUser.returning("*").execute();
        return updated.affected && updated.affected > 0
          ? { data: updated.raw[0] }
          : { error: "User does not exist!" };
      } catch (err) {
        return { error: "umable to perform operations at this time!" };
      }
    },
    async deleteUser(_, { id }, { data }) {
      if (!id) return false;
      try {
        const deleteData = await data
          .createQueryBuilder()
          .delete()
          .from(User)
          .where("id =:id", { id })
          .execute();
        return deleteData.affected && deleteData.affected > 0 ? true : false;
      } catch (err) {
        return false;
      }
    },
  },
};

export { userResolver };
