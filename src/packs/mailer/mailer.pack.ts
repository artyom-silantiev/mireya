import { SendEmailType, useEnv } from '~/lib/env/env';
import { MailerSendService } from './mailer-send.service';
import { MailerService } from './mailer.service';
import { MailerTasksService } from './mailer.tasks.service';
import * as AppLifecycle from '~/lib/app_lifecycle';

const mailerTasksService = new MailerTasksService();
export const mailerService = new MailerService(mailerTasksService);
export const mailerSendService = new MailerSendService(mailerService);

AppLifecycle.onAppInit(() => {
  const env = useEnv();

  if (
    env.isMasterNode() &&
    env.MAILER_SEND_EMAIL_TYPE === SendEmailType.queue
  ) {
    mailerService.startMailerQueueCronJob();
  }
});
