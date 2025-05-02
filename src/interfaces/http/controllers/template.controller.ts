import type {TemplateService} from '@root/application/chat/use-cases/template.service'

import type {InstanceDto} from '../dtos/instance.dto'
import type {TemplateDto} from '../dtos/template.dto'

export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  public async createTemplate(instance: InstanceDto, data: TemplateDto) {
    return this.templateService.create(instance, data)
  }

  public async findTemplate(instance: InstanceDto) {
    return this.templateService.find(instance)
  }
}
