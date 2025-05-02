import type {WAMonitoringService} from '@root/application/chat/use-cases/monitor.service'

import type {OfferCallDto} from '../dtos/call.dto'
import type {InstanceDto} from '../dtos/instance.dto'

export class CallController {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async offerCall({instanceName}: InstanceDto, data: OfferCallDto) {
    return await this.waMonitor.waInstances[instanceName].offerCall(data)
  }
}
