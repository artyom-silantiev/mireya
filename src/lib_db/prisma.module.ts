import { PrismaClient } from '@prisma/client';
import { onAppDestroy } from '!src/lib_share/app_lifecycle';

export const prisma = new PrismaClient();

onAppDestroy(async () => {
  await prisma.$disconnect();
});
