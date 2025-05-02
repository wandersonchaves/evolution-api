import {authGuard} from '@api/guards/auth.guard'
import {
  instanceExistsGuard,
  instanceLoggedGuard,
} from '@api/guards/instance.guard'
import Telemetry from '@api/guards/telemetry.guard'
import {ChannelRouter} from '@api/integrations/channel/channel.router'
import {ChatbotRouter} from '@api/integrations/chatbot/chatbot.router'
import {EventRouter} from '@api/integrations/event/event.router'
import {StorageRouter} from '@api/integrations/storage/storage.router'
import {configService} from '@config/env.config'
import {getPackageJson} from '@root/shared/utils/getPackageJson'
import {Router} from 'express'
import fs from 'fs'
import mimeTypes from 'mime-types'
import path from 'path'

import {CallRouter} from './call.router'
import {ChatRouter} from './chat.router'
import {GroupRouter} from './group.router'
import {InstanceRouter} from './instance.router'
import {LabelRouter} from './label.router'
import {ProxyRouter} from './proxy.router'
import {MessageRouter} from './sendMessage.router'
import {SettingsRouter} from './settings.router'
import {TemplateRouter} from './template.router'
import {ViewsRouter} from './view.router'

enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  INTERNAL_SERVER_ERROR = 500,
}

export function buildRouter(): Router {
  const router = Router()
  const telemetry = new Telemetry()
  const serverConfig = configService.get('SERVER')
  const guards = [instanceExistsGuard, instanceLoggedGuard, authGuard['apikey']]
  const packageJson = getPackageJson()

  if (!serverConfig.DISABLE_MANAGER) {
    router.use('/manager', new ViewsRouter().router)

    router.get('/assets/*', (req, res) => {
      const fileName = req.params[0]
      const basePath = path.join(process.cwd(), 'manager', 'dist')
      const filePath = path.join(basePath, 'assets/', fileName)

      if (fs.existsSync(filePath)) {
        res.set('Content-Type', mimeTypes.lookup(filePath) || 'text/css')
        res.send(fs.readFileSync(filePath))
      } else {
        res.status(HttpStatus.NOT_FOUND).send('File not found')
      }
    })
  }

  router
    .use((req, res, next) => telemetry.collectTelemetry(req, res, next))
    .get('/', (req, res) => {
      res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Welcome to the Evolution API, it is working!',
        version: packageJson.version,
        clientName: process.env.DATABASE_CONNECTION_CLIENT_NAME,
        manager: !serverConfig.DISABLE_MANAGER
          ? `${req.protocol}://${req.get('host')}/manager`
          : undefined,
        documentation: `https://doc.evolution-api.com`,
      })
    })
    .post('/verify-creds', authGuard['apikey'], (req, res) => {
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Credentials are valid',
        facebookAppId: process.env.FACEBOOK_APP_ID,
        facebookConfigId: process.env.FACEBOOK_CONFIG_ID,
        facebookUserToken: process.env.FACEBOOK_USER_TOKEN,
      })
    })

  router.use('/instance', new InstanceRouter(configService, ...guards).router)
  router.use('/message', new MessageRouter(...guards).router)
  router.use('/call', new CallRouter(...guards).router)
  router.use('/chat', new ChatRouter(...guards).router)
  router.use('/group', new GroupRouter(...guards).router)
  router.use('/template', new TemplateRouter(configService, ...guards).router)
  router.use('/settings', new SettingsRouter(...guards).router)
  router.use('/proxy', new ProxyRouter(...guards).router)
  router.use('/label', new LabelRouter(...guards).router)
  router.use('/channel', new ChannelRouter(configService, ...guards).router)
  router.use('/event', new EventRouter(configService, ...guards).router)
  router.use('/chatbot', new ChatbotRouter(...guards).router)
  router.use('/storage', new StorageRouter(...guards).router)

  return router
}

export {HttpStatus}
