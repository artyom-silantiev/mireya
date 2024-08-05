import { useEnv } from '~/lib/env/env';
import { mailerSendService } from '~/packs/mailer/mailer.pack';

await mailerSendService.sendTestEmail();

console.log(
  'test email sent',
  `MAILER_SEND_EMAIL_TYPE=${useEnv().MAILER_SEND_EMAIL_TYPE}`,
);
