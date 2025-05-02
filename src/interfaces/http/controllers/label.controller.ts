import type {WAMonitoringService} from '@root/application/chat/use-cases/monitor.service'

import type {InstanceDto} from '../dtos/instance.dto'
import type {HandleLabelDto} from '../dtos/label.dto'

export class LabelController {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async fetchLabels({instanceName}: InstanceDto) {
    return await this.waMonitor.waInstances[instanceName].fetchLabels()
  }

  public async handleLabel({instanceName}: InstanceDto, data: HandleLabelDto) {
    return await this.waMonitor.waInstances[instanceName].handleLabel(data)
  }
}
