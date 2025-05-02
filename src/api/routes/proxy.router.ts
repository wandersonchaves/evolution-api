import {RouterBroker} from '@api/abstract/abstract.router'
import {proxyController} from '@api/server.module'
import {InstanceDto} from '@root/interfaces/http/dtos/instance.dto'
import {ProxyDto} from '@root/interfaces/http/dtos/proxy.dto'
import {instanceSchema, proxySchema} from '@validate/validate.schema'
import {RequestHandler, Router} from 'express'

import {HttpStatus} from './index.router'

export class ProxyRouter extends RouterBroker {
  constructor(...guards: RequestHandler[]) {
    super()
    this.router
      .post(this.routerPath('set'), ...guards, async (req, res) => {
        const response = await this.dataValidate<ProxyDto>({
          request: req,
          schema: proxySchema,
          ClassRef: ProxyDto,
          execute: (instance, data) =>
            proxyController.createProxy(instance, data),
        })

        res.status(HttpStatus.CREATED).json(response)
      })
      .get(this.routerPath('find'), ...guards, async (req, res) => {
        const response = await this.dataValidate<InstanceDto>({
          request: req,
          schema: instanceSchema,
          ClassRef: InstanceDto,
          execute: (instance) => proxyController.findProxy(instance),
        })

        res.status(HttpStatus.OK).json(response)
      })
  }

  public readonly router: Router = Router()
}
