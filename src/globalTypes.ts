import { DataSource } from "typeorm";

export type MyContext = {
  token: string | string[] | undefined;
  data: DataSource;
};