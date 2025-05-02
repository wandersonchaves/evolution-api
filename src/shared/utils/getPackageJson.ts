import {readFileSync} from 'fs'
import {join} from 'path'

export const getPackageJson = () => {
  const packagePath = join(__dirname, '..', '..', '..', 'package.json')
  return JSON.parse(readFileSync(packagePath, 'utf8'))
}
