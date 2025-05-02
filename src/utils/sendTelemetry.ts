import {getPackageJson} from '@root/shared/utils/getPackageJson'
import axios from 'axios'

const packageJson = getPackageJson()

export interface TelemetryData {
  route: string
  apiVersion: string
  timestamp: Date
}

export const sendTelemetry = async (route: string): Promise<void> => {
  const enabled =
    process.env.TELEMETRY_ENABLED === undefined ||
    process.env.TELEMETRY_ENABLED === 'true'

  if (!enabled) {
    return
  }

  if (route === '/') {
    return
  }

  const telemetry: TelemetryData = {
    route,
    apiVersion: `${packageJson.version}`,
    timestamp: new Date(),
  }

  const url =
    process.env.TELEMETRY_URL && process.env.TELEMETRY_URL !== ''
      ? process.env.TELEMETRY_URL
      : 'https://log.evolution-api.com/telemetry'

  axios
    .post(url, telemetry)
    .then(() => {})
    .catch(() => {})
}
