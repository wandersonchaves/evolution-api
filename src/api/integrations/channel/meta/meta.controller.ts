import {Logger} from '@config/logger.config'
import type {WAMonitoringService} from '@root/application/chat/use-cases/monitor.service'
import type {PrismaRepository} from '@root/infrastructure/database/repositories/repository/repository.service'
import axios from 'axios'

import {
  ChannelController,
  ChannelControllerInterface,
} from '../channel.controller'

export class MetaController
  extends ChannelController
  implements ChannelControllerInterface
{
  private readonly logger = new Logger('MetaController')

  constructor(
    prismaRepository: PrismaRepository,
    waMonitor: WAMonitoringService,
  ) {
    super(prismaRepository, waMonitor)
  }

  integrationEnabled: boolean

  public async receiveWebhook(data: any) {
    if (data.object === 'whatsapp_business_account') {
      if (
        data.entry[0]?.changes[0]?.field === 'message_template_status_update'
      ) {
        const template = await this.prismaRepository.template.findFirst({
          where: {
            templateId: `${data.entry[0].changes[0].value.message_template_id}`,
          },
        })

        if (!template) {
          console.log('template not found')
          return
        }

        const {webhookUrl} = template

        await axios.post(webhookUrl, data.entry[0].changes[0].value, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return
      }

      data.entry?.forEach(async (entry: any) => {
        const numberId = entry.changes[0].value.metadata.phone_number_id

        if (!numberId) {
          this.logger.error(
            'WebhookService -> receiveWebhookMeta -> numberId not found',
          )
          return {
            status: 'success',
          }
        }

        const instance = await this.prismaRepository.instance.findFirst({
          where: {number: numberId},
        })

        if (!instance) {
          this.logger.error(
            'WebhookService -> receiveWebhookMeta -> instance not found',
          )
          return {
            status: 'success',
          }
        }

        await this.waMonitor.waInstances[instance.name].connectToWhatsapp(data)

        return {
          status: 'success',
        }
      })
    }

    return {
      status: 'success',
    }
  }
}
