import { neon } from "@neondatabase/serverless";

// Connection string for your Neon database
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_KM4id5ogWehy@ep-withered-night-a8nrhwnx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

export { sql };
