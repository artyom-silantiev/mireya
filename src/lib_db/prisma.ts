import { PrismaClient } from '@prisma/client';
import { AppLifecycle } from '!src/lib_share/app_lifecycle';

export const prisma = new PrismaClient();

AppLifecycle.onAppDestroy(async () => {
  await prisma.$disconnect();
});
