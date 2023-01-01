import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema/schema.graphql",
  generates: {
    "./src/generated/resolvers-types.ts": {
      config: {
        contextType: "../index#MyContext",
        useIndexSignature: true,
      },
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-operations",
        "typescript-urql",
      ],
    },
  },
};
export default config;
