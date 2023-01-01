import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
/* import { ObjectType, Field, ID } from "type-graphql"; */

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index({ unique: true })
  title?: string;

  @Column({type: "text"})
  content?: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
}
