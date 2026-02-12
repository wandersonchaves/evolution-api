const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { existsSync, rmSync } = require('fs');

dotenv.config();

// provider definido por env ou default
const databaseProvider = process.env.DATABASE_PROVIDER || 'postgresql';

// caminhos de schema/migrations
const schemaPath = `prisma/${databaseProvider}/${databaseProvider}-schema.prisma`;
const migrationsPath = `prisma/${databaseProvider}/migrations`;

if (!process.env.DATABASE_PROVIDER) {
  console.warn(`[WARN] DATABASE_PROVIDER not set. Using default: ${databaseProvider}`);
}

// psql_bouncer usa as migrations do postgresql
function getMigrationsFolder(provider) {
  return provider === 'psql_bouncer' ? 'postgresql-migrations' : `${provider}-migrations`;
}

const migrationsFolder = getMigrationsFolder(databaseProvider);

let command = process.argv
  .slice(2)
  .join(' ')
  .replace(/DATABASE_PROVIDER/g, databaseProvider)
  .replace(/SCHEMA_PATH/g, schemaPath)
  .replace(/MIGRATIONS_PATH/g, migrationsPath);

// troca a pasta de migrations padrão pela correta
command = command.replace(new RegExp(`${databaseProvider}-migrations`, 'g'), migrationsFolder);

// remoção cross-platform (Linux/Windows) - evita rmdir do windows
if (command.includes('rmdir') || command.includes('rm -rf')) {
  if (existsSync('prisma/migrations')) {
    rmSync('prisma/migrations', { recursive: true, force: true });
  }
  // remove do command qualquer tentativa de rmdir específica
  command = command.replace(/rmdir\s+\/S\s+\/Q\s+prisma\\migrations/g, '');
}

try {
  execSync(command.trim(), { stdio: 'inherit' });
} catch (error) {
  console.error(`❌ Error executing command: ${command}`);
  process.exit(1);
}