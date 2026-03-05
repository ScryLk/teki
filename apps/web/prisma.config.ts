import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Transaction mode (pgbouncer) para o app em runtime
    url: process.env["DATABASE_URL"],
  },
});
