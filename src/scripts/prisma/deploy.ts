import {execSync} from 'child_process'
import dotenv from 'dotenv'

dotenv.config()
execSync(
  `npx prisma migrate deploy --schema prisma/${process.env.DATABASE_PROVIDER}-schema.prisma`,
  {stdio: 'inherit'},
)
