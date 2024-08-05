import type { MailerService } from './mailer.service';

export class MailerSendService {
  constructor(private readonly mailer: MailerService) {}

  async sendTestEmail() {
    await this.mailer.sendEmail({
      template: 'test_email',
      to: 'test@localhost.local',
      subject: 'Test email',
      context: {
        message: 'Hello! ' + Date.now(),
      },
    });
  }
}
