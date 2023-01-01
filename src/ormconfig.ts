import { DataSourceOptions } from "typeorm";
import { __prod__ } from "./constants";
import { Post } from "./entities/post.entities";
import { User } from "./entities/user.entities";

export const typeormConfig: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  entities: [Post, User],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  subscribers: [],
  database: "liredit",
  username: "odundlaw",
  synchronize: true,
  password: "lawman1994@",
  logging: !__prod__,
};
