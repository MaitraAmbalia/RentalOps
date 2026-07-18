const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully via Prisma");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

module.exports = { prisma, connectDB };
