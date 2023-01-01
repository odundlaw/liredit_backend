import { GraphQLScalarType, Kind } from "graphql";

const stringOrInt = new GraphQLScalarType({
  name: "stringOrInt",
  description: "Ability to use both string and Int",
  serialize(value: string | number) {
    if (typeof value !== "string" && typeof value !== "number") {
      throw new Error("Value must be either a String or an Int");
    }
    if (typeof value === "number" && !Number.isInteger(value)) {
      throw new Error("Number value must be an Int");
    }
    return value;
  },
  parseValue(value: string | number) {
    if (typeof value !== "string" && typeof value !== "number") {
      throw new Error("Value must be either a String or an Int");
    }
    if (typeof value === "number" && !Number.isInteger(value)) {
      throw new Error("Number value must be an Int");
    }
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.STRING:
        return ast.value;
      default:
        throw new Error("Value must be either a String or an Int");
    }
  },
});

export { stringOrInt }