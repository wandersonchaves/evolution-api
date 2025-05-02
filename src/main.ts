import '@utils/instrumentSentry'

import {ProviderFiles} from '@api/provider/sessions'
import {buildRouter} from '@api/routes/index.router'
import {eventManager, waMonitor} from '@api/server.module'
import {
  Auth,
  configService,
  Cors,
  HttpServer,
  Webhook,
} from '@config/env.config'
import {onUnexpectedError} from '@config/error.config'
import {Logger} from '@config/logger.config'
import * as Sentry from '@sentry/node'
import {ServerUP} from '@utils/server-up'
import axios from 'axios'
import compression from 'compression'
import cors from 'cors'
import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from 'express'
import {join} from 'path'

import {PrismaRepository} from './infrastructure/database/repositories/repository/repository.service'

function initWhatsappInstances() {
  waMonitor.loadInstance()
}

async function bootstrap() {
  const logger = new Logger('SERVER')
  const app = express()

  const providerConfig = configService.get('PROVIDER')
  let providerFiles: ProviderFiles | null = null

  if (providerConfig.ENABLED) {
    providerFiles = new ProviderFiles(configService)
    await providerFiles.onModuleInit()
    logger.info('Provider Files initialized')
  }

  const prismaRepository = new PrismaRepository(configService)
  await prismaRepository.onModuleInit()

  const corsConfig = configService.get<Cors>('CORS')
  app.use(
    cors({
      origin(requestOrigin, callback) {
        if (
          corsConfig.ORIGIN.includes('*') ||
          corsConfig.ORIGIN.includes(requestOrigin)
        ) {
          return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
      },
      methods: corsConfig.METHODS,
      credentials: corsConfig.CREDENTIALS,
    }),
    urlencoded({extended: true, limit: '136mb'}),
    json({limit: '136mb'}),
    compression(),
  )

  app.set('view engine', 'hbs')
  app.set('views', join(process.cwd(), 'views'))
  app.use(express.static(join(process.cwd(), 'public')))
  app.use('/store', express.static(join(process.cwd(), 'store')))

  app.use('/', buildRouter())

  app.use(globalErrorHandler(logger))
  app.use(notFoundHandler)

  const serverConfig = configService.get<HttpServer>('SERVER')
  const PORT = process.env.PORT || serverConfig.PORT

  ServerUP.app = app
  const server = ServerUP[serverConfig.TYPE]
  eventManager.init(server)

  if (process.env.SENTRY_DSN) {
    logger.info('Sentry Enabled')
    Sentry.setupExpressErrorHandler(app)
  }

  server.listen(PORT, () =>
    logger.log(
      `${serverConfig.TYPE.toUpperCase()} - Listening on port ${PORT}`,
    ),
  )

  initWhatsappInstances()
  onUnexpectedError()
}

function globalErrorHandler(logger: Logger) {
  return async (err: Error, req: Request, res: Response) => {
    const webhook = configService.get<Webhook>('WEBHOOK')
    const auth = configService.get<Auth>('AUTHENTICATION')
    const serverUrl = configService.get<HttpServer>('SERVER').URL
    const timestamp = new Date().toISOString()

    const errorData = {
      event: 'error',
      data: {
        error: err['error'] || 'Internal Server Error',
        message: err['message'] || 'Internal Server Error',
        status: err['status'] || 500,
        response: {
          message: err['message'] || 'Internal Server Error',
        },
      },
      date_time: timestamp,
      api_key: auth.API_KEY.KEY,
      server_url: serverUrl,
    }

    if (webhook.EVENTS.ERRORS_WEBHOOK && webhook.EVENTS.ERRORS) {
      try {
        logger.error(errorData)
        const httpService = axios.create({
          baseURL: webhook.EVENTS.ERRORS_WEBHOOK,
        })
        await httpService.post('', errorData)
      } catch (sendError) {
        logger.warn(
          `Failed to send error webhook: ${sendError instanceof Error ? sendError.message : sendError}`,
        )
      }
    }

    res.status(err['status'] || 500).json(errorData)
  }
}

function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    response: {
      message: [`Cannot ${req.method.toUpperCase()} ${req.originalUrl}`],
    },
  })
  next()
}

bootstrap()
