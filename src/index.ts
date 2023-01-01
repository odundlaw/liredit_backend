import "reflect-metadata";
import express, { Application, Request, Response } from "express";
import http from "http";
import { __prod__ } from "./constants";
import logger from "./config/logger";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { DataSource } from "typeorm";
import { typeormConfig } from "./ormconfig";
import { ApolloServer } from "@apollo/server";
import { postResolvers } from "./resolvers/post.resolvers";
import { helloResolver } from "./resolvers/hello.resolvers";
import { userResolver } from "./resolvers/user.resolvers";
import { readFileSync } from "fs";
import { sessionMiddleware } from "./middleware/session";

export type MyContext = {
  token: string | string[] | undefined;
  data: DataSource;
  req: Request;
  res: Response;
};

const typeDefs = readFileSync("./src/schema/schema.graphql", {
  encoding: "utf-8",
});

const AppDataSource = new DataSource(typeormConfig);

const DI = {} as {
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
};
const app: Application = express();
const port = __prod__ ? process.env.PORT : 8080;

const main = async () => {
  try {
    const dataSource = await AppDataSource.initialize();

    DI.server = http.createServer(app);

    const apolloServer = new ApolloServer<MyContext>({
      typeDefs,
      resolvers: [helloResolver, postResolvers, userResolver],
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: DI.server })],
    });
    await apolloServer.start();
    app.set("trust proxy", !__prod__);
    sessionMiddleware(app);
    app.use(
      "/",
      cors<cors.CorsRequest>({
        origin: ["https://studio.apollographql.com", "http://localhost:5173"],
        credentials: true,
      }),
      express.json(),
      expressMiddleware(apolloServer, {
        context: async ({ req, res }) => ({
          token: req.headers.token,
          req: req,
          res: res,
          data: dataSource,
        }),
      })
    );

    await new Promise<void>((resolve) =>
      DI.server.listen({ port: port }, resolve)
    );

    logger.info({
      message: `App Listening on Port ${port}`,
      service: "ORM service",
    });
  } catch (err: any) {
    throw new Error(err);
  }
};

main().catch((err) => {
  logger.error({ message: err, service: "ORM Service" });
});
