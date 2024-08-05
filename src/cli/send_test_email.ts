import { mailerSendService } from '~/packs/mailer/mailer.pack';

await mailerSendService.sendTestEmail();

console.log('test email sent');
