const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

dotenv.config();

const databaseProvider = process.env.DATABASE_PROVIDER ?? 'postgresql';

const schemaPath = `prisma/${databaseProvider}/${databaseProvider}-schema.prisma`;
const migrationsPath = `prisma/${databaseProvider}/migrations`;

if (!existsSync(schemaPath)) {
  console.error(`❌ Prisma schema not found at: ${schemaPath}`);
  process.exit(1);
}

let command = process.argv
  .slice(2)
  .join(' ')
  .replace(/DATABASE_PROVIDER/g, databaseProvider)
  .replace(/SCHEMA_PATH/g, schemaPath)
  .replace(/MIGRATIONS_PATH/g, migrationsPath);

if (command.includes('rm -rf') && !existsSync(migrationsPath)) {
  console.warn(`⚠️ Migrations directory not found at: ${migrationsPath}`);
  command = command.replace(/rm -rf .*? && /, '');
}

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Error executing command: ${command}`);
  process.exit(1);
}