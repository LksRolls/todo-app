import { PrismaClient, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@todo.com' },
    update: {},
    create: {
      email: 'test@todo.com',
      passwordHash,
      displayName: 'Test User',
    },
  });

  const group = await prisma.group.upsert({
    where: { id: 'seed-general-group' },
    update: {},
    create: {
      id: 'seed-general-group',
      userId: user.id,
      name: 'G\u00e9n\u00e9ral',
      color: '#2d6a4f',
      order: 0,
    },
  });

  const tasks = [
    { title: 'D\u00e9couvrir l\u2019application', priority: Priority.LOW, order: 0 },
    { title: 'Cr\u00e9er mon premier groupe', priority: Priority.MEDIUM, order: 1 },
    { title: 'Organiser mes t\u00e2ches', priority: Priority.HIGH, order: 2 },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        groupId: group.id,
        userId: user.id,
        title: task.title,
        priority: task.priority,
        order: task.order,
      },
    });
  }

  console.log('Seed completed: user, group, and tasks created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
