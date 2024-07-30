import { PrismaClient } from '@prisma/client';
import { onAppDestroy } from '!src/lib_share/app_lifecycle';

const prisma = new PrismaClient();

export function usePrisma() {
  return prisma;
}

onAppDestroy(async () => {
  await prisma.$disconnect();
});
