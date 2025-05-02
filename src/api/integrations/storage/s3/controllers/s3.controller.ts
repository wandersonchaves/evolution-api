import {MediaDto} from '@api/integrations/storage/s3/dto/media.dto'
import {S3Service} from '@api/integrations/storage/s3/services/s3.service'
import type {InstanceDto} from '@root/interfaces/http/dtos/instance.dto'

export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  public async getMedia(instance: InstanceDto, data: MediaDto) {
    return this.s3Service.getMedia(instance, data)
  }

  public async getMediaUrl(instance: InstanceDto, data: MediaDto) {
    return this.s3Service.getMediaUrl(instance, data)
  }
}
