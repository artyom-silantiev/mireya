import * as path from 'path';
import * as nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import * as fs from 'fs-extra';
import type { MailerTasksService } from './mailer.tasks.service';
import { SendEmailType, useEnv } from '~/lib/env/env';
import type { SendEmailParams } from './types';
import { CronJob } from 'cron';

const env = useEnv();
const EmailTemplatesDir = path.join(process.cwd(), 'assets', 'email_templates');

export class MailerService {
  private mailer!: nodemailer.Transporter;
  private cronJob!: CronJob;

  constructor(private mailerTasksService: MailerTasksService) {
    this.mailer = nodemailer.createTransport({
      host: env.MAILER_SMTP_HOST,
      port: env.MAILER_SMTP_PORT,
      secure: env.MAILER_SMTP_SECURE,
      sender: env.MAILER_DEFAULT_SENDER,
      auth: {
        user: env.MAILER_SMTP_AUTH_USER,
        pass: env.MAILER_SMTP_AUTH_PASS,
      },
    });
  }

  private renderTemplate(params: SendEmailParams) {
    if (!params.template) {
      return;
    }

    if (!params.template.endsWith('.hbs')) {
      params.template += '.hbs';
    }

    const templateCode = fs.readFileSync(params.template);
    const template = Handlebars.compile(templateCode.toString());
    const renderResult = template(params.context || {});
    return renderResult;
  }

  private async sendEmailNow(params: SendEmailParams) {
    if (params.template) {
      params.html = this.renderTemplate(params);
    }

    return this.mailer.sendMail(params);
  }

  private async sendEmailTask(params: SendEmailParams) {
    await this.mailerTasksService.taskCreate(params);
  }

  async sendEmail(params: SendEmailParams) {
    if (params.template) {
      params.template = path.join(EmailTemplatesDir, params.template);
    }

    if (env.MAILER_SEND_EMAIL_TYPE === SendEmailType.sync) {
      return await this.sendEmailNow(params);
    } else if (env.MAILER_SEND_EMAIL_TYPE === SendEmailType.queue) {
      await this.sendEmailTask(params);
    }
  }

  async startMailerQueueCronJob() {
    if (this.cronJob) {
      return;
    }

    this.cronJob = CronJob.from({
      cronTime: '*/5 * * * * *',
      onTick: async () => {
        await this.mailerTasksService.handleWrapPack(3, async (ctx) => {
          await this.sendEmailNow(ctx.task.data);
        });
      },
      start: true,
    });

    console.log('- run cron job: mailer queue');
  }
}
