import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config";

// Pool:- a pool of database connections that can be reused. using this will increase the performance of the application
const pool = new Pool({ connectionString: config.databaseUrl });

// adapter :- it tell the prisma client how to talk with the database
// this allows the prisma client to be database agnostic
// for example if we want to switch from postgres to mysql we can create a new adapter for mysql and pass it to the prisma client without chaning the entire application
// this is called dependency injection -> this is used to create a reusable client that can be used in the entire application
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter }); // this line is creating the prisma client
