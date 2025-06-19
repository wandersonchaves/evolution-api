import { RouterBroker } from '@api/abstract/abstract.router';
import { nextbotController } from '@api/server.module';
import { ConfigService } from '@config/env.config';
import { Router } from 'express';

export class NextBotRouter extends RouterBroker {
  constructor(readonly configService: ConfigService) {
    super();
    this.router.post(this.routerPath('webhook/nextbot', false), async (req, res) => {
      const { body } = req;
      const response = await nextbotController.receiveWebhook(body);

      return res.status(200).json(response);
    });
  }

  public readonly router: Router = Router();
}
