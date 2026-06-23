import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type TreeRarity } from '../src/generated/prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

// Plantillas de prueba: una por cada rareza.
// Las imágenes usan placehold.co coloreado por rareza para que siempre carguen.
const TEMPLATES: { name: string; category: string; rarity: TreeRarity; color: string; description: string }[] = [
  { name: 'Secuoya Milenaria', category: 'Conífero', rarity: 'legendario', color: 'FFD700', description: 'Un gigante ancestral que ha visto pasar siglos.' },
  { name: 'Cerezo Sakura', category: 'Frutal', rarity: 'epico', color: '9333EA', description: 'Sus flores rosadas anuncian la primavera.' },
  { name: 'Roble Ancestral', category: 'Templado', rarity: 'raro', color: '3B82F6', description: 'Símbolo de fuerza y longevidad.' },
  { name: 'Pino Nórdico', category: 'Conífero', rarity: 'poco_comun', color: '22C55E', description: 'Resistente al frío de los bosques boreales.' },
  { name: 'Palmera Tropical', category: 'Tropical', rarity: 'comun', color: '6B7280', description: 'Crece junto a playas de aguas cristalinas.' },
  { name: 'Arce Rojo', category: 'Templado', rarity: 'comun', color: '6B7280', description: 'Sus hojas tiñen de rojo el otoño.' },
];

async function main() {
  const [adminHash, userHash] = await Promise.all([
    hashPassword('Admin1234'),
    hashPassword('User1234'),
  ]);

  // Upsert por username (clave de login y campo único que puede colisionar con datos previos).
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { email: 'admin@pomodoro.test', role: 'admin', emailVerified: true, passwordHash: adminHash },
    create: {
      username: 'admin',
      email: 'admin@pomodoro.test',
      passwordHash: adminHash,
      emailVerified: true,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'usuario' },
    update: { email: 'user@pomodoro.test', role: 'user', emailVerified: true, passwordHash: userHash },
    create: {
      username: 'usuario',
      email: 'user@pomodoro.test',
      passwordHash: userHash,
      emailVerified: true,
      role: 'user',
    },
  });

  for (const t of TEMPLATES) {
    const exists = await prisma.template.findFirst({ where: { name: t.name } });
    if (exists) continue;
    await prisma.template.create({
      data: {
        name: t.name,
        category: t.category,
        description: t.description,
        imageUrl: `https://placehold.co/500x500/${t.color}/FFFFFF/png?text=${encodeURIComponent(t.name)}`,
        rarity: t.rarity,
        createdById: admin.id,
      },
    });
  }

  const templateCount = await prisma.template.count();
  console.log('✅ Seed completado:');
  console.log('   admin@pomodoro.test  /  Admin1234   (rol admin)');
  console.log('   user@pomodoro.test   /  User1234    (rol user)');
  console.log(`   ${templateCount} plantillas de árboles en total`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
