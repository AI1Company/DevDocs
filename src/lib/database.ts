import { neon } from "@neondatabase/serverless";

// Connection string for your Neon database
const sql = neon(
  "postgresql://neondb_owner:npg_KM4id5ogWehy@ep-withered-night-a8nrhwnx-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
);

export { sql };
