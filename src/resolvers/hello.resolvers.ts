import { stringOrInt } from "../graphqlCustomScalar/intOrString";
import { Resolvers } from "../generated/resolvers-types";

const helloResolver: Resolvers = {
  StringOrInt: stringOrInt,
  Query: {
    hello: (_, args, ctx) => {
      console.log(ctx, args);
      return "Hello!";
    },
  },
};

export { helloResolver };
