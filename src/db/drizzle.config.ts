import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = (rawDatabaseUrl && (rawDatabaseUrl.startsWith("postgres://") || rawDatabaseUrl.startsWith("postgresql://"))) ? rawDatabaseUrl : undefined;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

const dbCredentials = databaseUrl 
  ? { url: databaseUrl }
  : {
      host: sqlHost || "",
      user: user || "",
      password: password || "",
      database: sqlDbName || "",
      ssl: false,
    };

if (!databaseUrl && (!sqlHost || !sqlDbName || !user || !password)) {
  throw new Error("Either DATABASE_URL or SQL_HOST, SQL_DB_NAME, SQL_ADMIN_USER, and SQL_ADMIN_PASSWORD must be set in environment variables.");
}

if (databaseUrl) {
  console.log("Using DATABASE_URL connection string for database config.");
} else {
  console.log(`Using admin user: ${user} to connect to database.`);
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials,
  verbose: true,
});
