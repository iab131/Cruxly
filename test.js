require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany().then(users => console.log(JSON.stringify(users))).finally(() => p.$disconnect());
