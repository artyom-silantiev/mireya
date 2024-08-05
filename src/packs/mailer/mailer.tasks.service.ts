import { usePrisma } from '~/lib/prisma';
import type { SendEmailParams } from './types';
import type { Prisma, TaskMailSend } from '@prisma/client';

export class MailerTasksService {
  prisma = usePrisma();

  async taskCreate(taskData: SendEmailParams) {
    const newTask = await this.prisma.taskMailSend.create({
      data: {
        data: taskData as Prisma.InputJsonValue,
      },
    });
    return newTask;
  }

  async getNextTasks(maxAttempts = 3, count = 1) {
    const tasks = (await this.prisma.taskMailSend.findMany({
      where: {
        isActive: false,
        isFail: false,
        attempts: {
          lt: maxAttempts,
        },
      },
      orderBy: {
        id: 'asc',
      },
      take: count,
    })) as (TaskMailSend & {
      data: SendEmailParams;
    })[];

    return tasks;
  }

  async handleWrapPack(
    maxAttempts: number,
    handle: (ctx: {
      task: TaskMailSend & { data: SendEmailParams };
    }) => Promise<void>,
    count = 1,
  ) {
    const tasks = await this.getNextTasks(maxAttempts, count);

    for (const task of tasks) {
      const ctx = { task };

      try {
        await this.prisma.taskMailSend.update({
          where: {
            id: ctx.task.id,
          },
          data: {
            isActive: true,
          },
        });

        await handle(ctx);

        await this.prisma.taskMailSend.delete({
          where: {
            id: ctx.task.id,
          },
        });
      } catch (error) {
        console.error(error);

        const errorEr = error as Error;
        let attemts = ctx.task.attempts;
        attemts += 1;

        if (attemts < maxAttempts) {
          await this.prisma.taskMailSend.update({
            where: {
              id: ctx.task.id,
            },
            data: {
              isActive: false,
              attempts: attemts,
            },
          });
        } else {
          const errorText = errorEr.stack ? errorEr.stack : String(errorEr);
          await this.prisma.taskMailSend.update({
            where: {
              id: ctx.task.id,
            },
            data: {
              attempts: attemts,
              errorText: errorText,
              isActive: false,
              isFail: true,
              failAt: new Date().toISOString(),
            },
          });
        }
      }
    }
  }

  // class MailerTasksService
}
