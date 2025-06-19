import { BaseChatbotDto, BaseChatbotSettingDto } from '../../base-chatbot.dto';

export class NextBotDto extends BaseChatbotDto {
  apiUrl: string;
  apiKey: string;
}

export class NextBotSettingDto extends BaseChatbotSettingDto {
  botIdFallback?: string;
}
