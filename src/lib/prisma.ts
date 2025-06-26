import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

export type FullAuthor = Prisma.AuthorGetPayload<{ select: { [K in keyof Required<Prisma.AuthorSelect>]: true } }>