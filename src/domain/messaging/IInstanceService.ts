export interface IInstanceService {
  instanceName: string
  setInstance(data: {
    instanceId: string
    instanceName: string
    integration?: string
    token: string
    number: string
    businessId?: string
  }): void
  sendDataWebhook(event: string, payload: any): void
  connectToWhatsapp?(number?: string): Promise<any>
  connectionStatus: {state: string}
  qrCode?: any
  setInstance(data: {
    instanceName: string
    instanceId: string
    integration?: string
    token: string
    number: string
    businessId?: string
  }): void
  sendDataWebhook(event: string, payload: any): void
}
