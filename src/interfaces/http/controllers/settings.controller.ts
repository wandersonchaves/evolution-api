import type {SettingsService} from '@root/application/chat/use-cases/settings.service'

import type {InstanceDto} from '../dtos/instance.dto'
import type {SettingsDto} from '../dtos/settings.dto'

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  public async createSettings(instance: InstanceDto, data: SettingsDto) {
    return this.settingsService.create(instance, data)
  }

  public async findSettings(instance: InstanceDto) {
    const settings = this.settingsService.find(instance)
    return settings
  }
}
