import * as nodemailer from 'nodemailer';

export type SendEmailParams = nodemailer.SendMailOptions & {
  template?: string;
  context?: any;
};
