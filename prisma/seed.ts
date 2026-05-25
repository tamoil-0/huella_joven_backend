import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12);

  const joven = await prisma.user.upsert({
    where: { email: 'diego.quispe@correo.pe' },
    update: {},
    create: {
      name: 'Diego Quispe',
      email: 'diego.quispe@correo.pe',
      passwordHash,
      district: 'Puno',
      type: 'joven'
    }
  });

  const validador = await prisma.user.upsert({
    where: { email: 'maria.condori@huellajoven.pe' },
    update: {},
    create: {
      name: 'Maria Condori',
      email: 'maria.condori@huellajoven.pe',
      passwordHash,
      district: 'Puno',
      type: 'validador',
      diagnosticDone: true
    }
  });

  const organizacion = await prisma.user.upsert({
    where: { email: 'ong@titicacavivo.pe' },
    update: {},
    create: {
      name: 'ONG Titicaca Vivo',
      email: 'ong@titicacavivo.pe',
      passwordHash,
      district: 'Puno',
      type: 'organizacion',
      diagnosticDone: true
    }
  });

  await prisma.activity.createMany({
    data: [
      {
        userId: joven.id,
        title: 'Campana de reciclaje - Mercado Laykakota',
        description:
          'Sensibilizamos a comerciantes sobre segregacion de residuos y armamos un punto de acopio temporal.',
        date: new Date('2025-10-15T09:00:00.000Z'),
        location: 'Mercado Laykakota, Puno',
        rubro: 'ambiente',
        hours: 6,
        beneficiaries: 45,
        role: 'Coordinador',
        validator: 'Prof. Maria Condori - I.E. San Carlos',
        reflection:
          'Aprendi a coordinar personas con distintos caracteres y adaptar el mensaje al publico.',
        status: 'validada',
        evidence: ['Foto de brigada', 'Acta de acopio']
      },
      {
        userId: joven.id,
        title: 'Reforzamiento escolar - Matematica 4to grado',
        description:
          'Apoye a estudiantes con fracciones y geometria usando materiales visuales y juegos.',
        date: new Date('2025-11-02T09:00:00.000Z'),
        location: 'I.E. San Carlos, Puno',
        rubro: 'educacion',
        hours: 4,
        beneficiaries: 12,
        role: 'Facilitador',
        validator: 'Lic. Roberto Quispe - Coordinador academico',
        reflection:
          'Desarrolle paciencia y aprendi a simplificar conceptos complejos.',
        status: 'validada',
        evidence: ['Lista de asistencia']
      },
      {
        userId: joven.id,
        title: 'Presupuesto Participativo Juvenil 2025',
        description:
          'Presente una propuesta para mejorar parques del barrio Villa del Lago junto a mi grupo.',
        date: new Date('2025-11-20T09:00:00.000Z'),
        location: 'Municipalidad Provincial de Puno',
        rubro: 'ciudadania',
        hours: 8,
        beneficiaries: 200,
        role: 'Vocero',
        validator: 'Oficina de Participacion Ciudadana',
        reflection:
          'Entendi como se toman decisiones de inversion publica local.',
        status: 'enviada',
        evidence: ['Documento de propuesta']
      }
    ],
    skipDuplicates: true
  });

  await prisma.opportunity.createMany({
    data: [
      {
        creatorId: organizacion.id,
        title: 'Brigada Lago Limpio',
        organizer: 'ONG Titicaca Vivo',
        place: 'Bahia interior de Puno',
        rubro: 'ambiente',
        date: new Date('2026-06-08T14:00:00.000Z'),
        spots: 40,
        taken: 0,
        description:
          'Jornada de limpieza, registro de residuos y educacion ambiental con vecinos de la zona.',
        roles: ['Voluntario', 'Coordinador de zona', 'Registro fotografico']
      },
      {
        creatorId: organizacion.id,
        title: 'Tutoria Sabatina en Juliaca',
        organizer: 'Red Educa Sur',
        place: 'Juliaca',
        rubro: 'educacion',
        date: new Date('2026-06-15T14:00:00.000Z'),
        spots: 25,
        taken: 0,
        description:
          'Acompanamiento escolar a ninas y ninos que necesitan reforzamiento en matematica y lectura.',
        roles: ['Tutor', 'Apoyo logistico']
      }
    ]
  });

  const group = await prisma.youthGroup.create({
    data: {
      name: 'Jovenes Villa del Lago',
      district: 'Puno',
      purpose: 'Mejorar parques, seguridad barrial y cultura ciudadana.'
    }
  });

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: joven.id }
  });
  await prisma.groupMessage.createMany({
    data: [
      { groupId: group.id, userId: joven.id, body: 'Confirmado el sabado.' },
      { groupId: group.id, userId: validador.id, body: 'Lleven el acta y lapiceros.' }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: joven.id,
        title: 'Actividad validada',
        body: 'Tu campana de reciclaje fue aprobada por Maria Condori.'
      },
      {
        userId: joven.id,
        title: 'Recordatorio',
        body: 'Manana tienes una oportunidad cerca de Puno.',
        unread: false
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
