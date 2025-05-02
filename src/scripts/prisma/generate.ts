// scripts/prisma/generate.ts
import {execSync} from 'node:child_process'

console.log('🧬 Running Prisma Generate...')
execSync('npx prisma generate', {stdio: 'inherit'})
