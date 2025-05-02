import {existsSync, readFileSync} from 'fs'
import {join} from 'path'

export const getPackageJson = () => {
  try {
    const pathOptions = [
      join(__dirname, '..', '..', '..', 'package.json'),
      join(__dirname, '..', '..', 'package.json'),
    ]

    for (const path of pathOptions) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf8'))
      }
    }

    return {version: 'unknown'}
  } catch {
    return {version: 'unknown'}
  }
}
