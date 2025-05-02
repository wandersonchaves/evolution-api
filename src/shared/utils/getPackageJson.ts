import fs from 'fs'
import path from 'path'

export const getPackageJson = () => {
  const file = path.join(__dirname, '../../../package.json')
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}
