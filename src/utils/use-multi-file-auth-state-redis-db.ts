import {Logger} from '@config/logger.config'
import type {CacheService} from '@root/application/chat/use-cases/cache.service'
import {
  AuthenticationCreds,
  AuthenticationState,
  initAuthCreds,
  proto,
  SignalDataTypeMap,
} from 'baileys'

export async function useMultiFileAuthStateRedisDb(
  instanceName: string,
  cache: CacheService,
): Promise<{
  state: AuthenticationState
  saveCreds: () => Promise<void>
}> {
  const logger = new Logger('useMultiFileAuthStateRedisDb')

  const writeData = async (data: any, key: string): Promise<any> => {
    try {
      return await cache.hSet(instanceName, key, data)
    } catch (error) {
      return logger.error({localError: 'writeData', error})
    }
  }

  const readData = async (key: string): Promise<any> => {
    try {
      return await cache.hGet(instanceName, key)
    } catch (error) {
      logger.error({localError: 'readData', error})
      return
    }
  }

  const removeData = async (key: string) => {
    try {
      return await cache.hDelete(instanceName, key)
    } catch (error) {
      logger.error({readData: 'removeData', error})
    }
  }

  const creds: AuthenticationCreds =
    (await readData('creds')) || initAuthCreds()

  type SignalDataValue<T extends keyof SignalDataTypeMap> = SignalDataTypeMap[T]

  return {
    state: {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<Record<string, SignalDataValue<T>>> => {
          const data: Record<string, SignalDataValue<T>> = {}

          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)

              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }

              data[id] = value
            }),
          )

          return data
        },
        set: async (data: any) => {
          const tasks: Promise<void>[] = []
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const key = `${category}-${id}`
              tasks.push(
                value ? await writeData(value, key) : await removeData(key),
              )
            }
          }

          await Promise.all(tasks)
        },
      },
    },
    saveCreds: async () => {
      return await writeData(creds, 'creds')
    },
  }
}
