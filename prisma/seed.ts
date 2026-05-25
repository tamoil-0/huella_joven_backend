import bcrypt from 'bcryptjs';
import { PrismaClient, type ActivityRubro, type ActivityStatus } from '@prisma/client';

const prisma = new PrismaClient();

const password = '123456';

type SeedActivity = {
  userId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  rubro: ActivityRubro;
  hours: number;
  beneficiaries: number;
  role: string;
  validator: string;
  reflection: string;
  status: ActivityStatus;
  evidence: string[];
};

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.groupMessage.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.youthGroup.deleteMany();
  await prisma.opportunityEnrollment.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.activityValidation.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetDatabase();

  const passwordHash = await bcrypt.hash(password, 12);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Diego Quispe',
        email: 'diego.quispe@correo.pe',
        passwordHash,
        district: 'Puno',
        type: 'joven'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ana Lucana',
        email: 'ana.lucana@correo.pe',
        passwordHash,
        district: 'Juliaca',
        type: 'joven',
        diagnosticDone: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Luis Mamani',
        email: 'luis.mamani@correo.pe',
        passwordHash,
        district: 'Los Olivos',
        type: 'joven',
        diagnosticDone: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Maria Condori',
        email: 'maria.condori@huellajoven.pe',
        passwordHash,
        district: 'Puno',
        type: 'validador',
        diagnosticDone: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Roberto Quispe',
        email: 'roberto.quispe@huellajoven.pe',
        passwordHash,
        district: 'Juliaca',
        type: 'validador',
        diagnosticDone: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'ONG Titicaca Vivo',
        email: 'ong@titicacavivo.pe',
        passwordHash,
        district: 'Puno',
        type: 'organizacion',
        diagnosticDone: true
      }
    })
  ]);

  const [diego, ana, luis, maria, roberto, org] = users;

  const activitySeeds: SeedActivity[] = [
    {
      userId: diego.id,
      title: 'Campana de reciclaje - Mercado Laykakota',
      description:
        'Sensibilizacion a comerciantes sobre segregacion de residuos y armado de punto de acopio temporal.',
      date: '2026-04-11T09:00:00.000Z',
      location: 'Mercado Laykakota, Puno',
      rubro: 'ambiente',
      hours: 6,
      beneficiaries: 45,
      role: 'Coordinador',
      validator: 'Maria Condori - I.E. San Carlos',
      reflection:
        'Aprendi a coordinar equipos y adaptar el mensaje a comerciantes con poco tiempo.',
      status: 'validada',
      evidence: ['Fotos de brigada', 'Acta de acopio', 'Lista de comercios']
    },
    {
      userId: diego.id,
      title: 'Reforzamiento escolar - Matematica 4to grado',
      description:
        'Acompanamiento a estudiantes con fracciones, geometria y ejercicios por estaciones.',
      date: '2026-04-20T15:00:00.000Z',
      location: 'I.E. San Carlos, Puno',
      rubro: 'educacion',
      hours: 4,
      beneficiaries: 18,
      role: 'Facilitador',
      validator: 'Roberto Quispe - Coordinador academico',
      reflection:
        'Practique paciencia y aprendi a explicar conceptos con materiales simples.',
      status: 'validada',
      evidence: ['Lista de asistencia', 'Fotos de aula']
    },
    {
      userId: diego.id,
      title: 'Presupuesto participativo juvenil 2026',
      description:
        'Presentacion de propuesta para mejorar parques del barrio Villa del Lago.',
      date: '2026-05-05T10:00:00.000Z',
      location: 'Municipalidad Provincial de Puno',
      rubro: 'ciudadania',
      hours: 8,
      beneficiaries: 220,
      role: 'Vocero',
      validator: 'Oficina de Participacion Ciudadana',
      reflection:
        'Entendi como se priorizan inversiones locales y como defender evidencia.',
      status: 'enviada',
      evidence: ['Documento de propuesta', 'Registro fotografico']
    },
    {
      userId: ana.id,
      title: 'Taller digital para adultos mayores',
      description:
        'Tres sesiones para usar WhatsApp, videollamadas y servicios digitales de salud.',
      date: '2026-05-09T16:00:00.000Z',
      location: 'Centro del Adulto Mayor, Juliaca',
      rubro: 'digital',
      hours: 9,
      beneficiaries: 16,
      role: 'Facilitadora',
      validator: 'Maria Condori - Red Huella Joven',
      reflection:
        'La tecnologia puede ser un puente entre generaciones cuando se ensena con calma.',
      status: 'pendiente',
      evidence: ['Fotos del taller', 'Ficha de sesiones']
    },
    {
      userId: ana.id,
      title: 'Mural por la convivencia',
      description:
        'Diseno participativo de mural con mensajes contra la discriminacion escolar.',
      date: '2026-05-13T13:00:00.000Z',
      location: 'Juliaca',
      rubro: 'cultura',
      hours: 5,
      beneficiaries: 70,
      role: 'Disenadora de dinamica',
      validator: 'Roberto Quispe - UGEL local',
      reflection:
        'El arte ayudo a que estudiantes expresen problemas dificiles de conversar.',
      status: 'observada',
      evidence: ['Boceto final', 'Foto del mural']
    },
    {
      userId: luis.id,
      title: 'Cabildo joven Lima Norte',
      description:
        'Mesa de dialogo sobre seguridad, transporte y recuperacion de espacios publicos.',
      date: '2026-05-18T14:00:00.000Z',
      location: 'Los Olivos, Lima',
      rubro: 'ciudadania',
      hours: 7,
      beneficiaries: 120,
      role: 'Relator',
      validator: 'Maria Condori - Equipo validador',
      reflection:
        'Ordenar acuerdos por prioridad ayudo a transformar quejas en propuestas.',
      status: 'enviada',
      evidence: ['Acta de acuerdos', 'Lista de participantes']
    },
    {
      userId: luis.id,
      title: 'Feria de salud mental joven',
      description:
        'Orientacion preventiva, derivacion a servicios y dinamicas de autocuidado.',
      date: '2026-05-21T09:00:00.000Z',
      location: 'Parque Naranjal, Lima Norte',
      rubro: 'salud',
      hours: 6,
      beneficiaries: 95,
      role: 'Orientador de modulo',
      validator: 'Roberto Quispe - Equipo validador',
      reflection:
        'Aprendi a escuchar sin juzgar y a derivar casos con responsabilidad.',
      status: 'validada',
      evidence: ['Fotos de feria', 'Ficha de derivaciones']
    }
  ];

  const activities = await Promise.all(
    activitySeeds.map((activity) =>
      prisma.activity.create({
        data: {
          ...activity,
          date: new Date(activity.date)
        }
      })
    )
  );

  await Promise.all(
    activities
      .filter((activity) => activity.status === 'validada' || activity.status === 'observada')
      .map((activity, index) =>
        prisma.activityValidation.create({
          data: {
            activityId: activity.id,
            validatorId: index % 2 === 0 ? maria.id : roberto.id,
            status: activity.status,
            comment:
              activity.status === 'validada'
                ? 'Evidencia clara y actividad consistente con los criterios.'
                : 'Falta precisar lista de participantes y contacto institucional.'
          }
        })
      )
  );

  await prisma.opportunity.createMany({
    data: [
      {
        creatorId: org.id,
        title: 'Brigada Lago Limpio',
        organizer: 'ONG Titicaca Vivo',
        place: 'Bahia interior de Puno',
        rubro: 'ambiente',
        date: new Date('2026-06-08T14:00:00.000Z'),
        spots: 40,
        taken: 24,
        description:
          'Jornada de limpieza, clasificacion de residuos y educacion ambiental con vecinos.',
        roles: ['Voluntario', 'Coordinador de zona', 'Registro fotografico']
      },
      {
        creatorId: org.id,
        title: 'Tutoria Sabatina en Juliaca',
        organizer: 'Red Educa Sur',
        place: 'Juliaca',
        rubro: 'educacion',
        date: new Date('2026-06-15T14:00:00.000Z'),
        spots: 25,
        taken: 18,
        description:
          'Acompanamiento escolar a ninas y ninos que necesitan reforzamiento.',
        roles: ['Tutor', 'Apoyo logistico', 'Registro de asistencia']
      },
      {
        creatorId: org.id,
        title: 'Cabildo Joven Lima Norte',
        organizer: 'Municipalidad de Los Olivos',
        place: 'Lima Norte',
        rubro: 'ciudadania',
        date: new Date('2026-06-22T15:00:00.000Z'),
        spots: 80,
        taken: 42,
        description:
          'Espacio de dialogo para priorizar seguridad, transporte y espacios publicos.',
        roles: ['Participante', 'Relator', 'Vocero']
      },
      {
        creatorId: org.id,
        title: 'Mapa digital de servicios juveniles',
        organizer: 'Laboratorio Civico Joven',
        place: 'Remoto / Puno',
        rubro: 'digital',
        date: new Date('2026-07-02T19:00:00.000Z'),
        spots: 30,
        taken: 11,
        description:
          'Levantamiento colaborativo de becas, salud, deporte y voluntariado en un mapa abierto.',
        roles: ['Investigador', 'Digitador', 'Validador de datos']
      },
      {
        creatorId: org.id,
        title: 'Festival Barrio Seguro',
        organizer: 'Colectivo Villa del Lago',
        place: 'Puno',
        rubro: 'cultura',
        date: new Date('2026-07-12T10:00:00.000Z'),
        spots: 50,
        taken: 19,
        description:
          'Activacion cultural con musica, mural comunitario y rutas seguras para escolares.',
        roles: ['Produccion', 'Mediacion cultural', 'Registro audiovisual']
      }
    ]
  });

  const groups = await Promise.all([
    prisma.youthGroup.create({
      data: {
        name: 'Jovenes Villa del Lago',
        district: 'Puno',
        purpose: 'Mejorar parques, seguridad barrial y cultura ciudadana.'
      }
    }),
    prisma.youthGroup.create({
      data: {
        name: 'Manazo Digital',
        district: 'Puno',
        purpose: 'Alfabetizacion digital para adultos mayores.'
      }
    }),
    prisma.youthGroup.create({
      data: {
        name: 'Cabildo Joven Lima Norte',
        district: 'Los Olivos',
        purpose: 'Convertir demandas juveniles en propuestas municipales.'
      }
    })
  ]);

  await prisma.groupMember.createMany({
    data: [
      { groupId: groups[0].id, userId: diego.id },
      { groupId: groups[0].id, userId: maria.id },
      { groupId: groups[1].id, userId: ana.id },
      { groupId: groups[1].id, userId: roberto.id },
      { groupId: groups[2].id, userId: luis.id },
      { groupId: groups[2].id, userId: org.id }
    ]
  });

  await prisma.groupMessage.createMany({
    data: [
      { groupId: groups[0].id, userId: diego.id, body: 'Confirmado el sabado. Llevo acta y lapiceros.' },
      { groupId: groups[0].id, userId: maria.id, body: 'Recuerden tomar foto del antes y despues.' },
      { groupId: groups[1].id, userId: ana.id, body: 'Ya tenemos aula y proyector para el taller.' },
      { groupId: groups[1].id, userId: roberto.id, body: 'Validare la asistencia con la ficha simple.' },
      { groupId: groups[2].id, userId: luis.id, body: 'Estoy cerrando el acta de acuerdos del cabildo.' }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: diego.id,
        title: 'Actividad validada',
        body: 'Tu campana de reciclaje fue aprobada por Maria Condori.'
      },
      {
        userId: diego.id,
        title: 'Actividad enviada',
        body: 'Tu propuesta de presupuesto participativo esta en cola de validacion.'
      },
      {
        userId: ana.id,
        title: 'Observacion recibida',
        body: 'Tu mural necesita completar evidencia institucional.',
        unread: false
      },
      {
        userId: maria.id,
        title: 'Nuevas actividades por revisar',
        body: 'Tienes solicitudes pendientes de Puno y Lima Norte.'
      },
      {
        userId: roberto.id,
        title: 'Revision academica',
        body: 'Hay evidencias educativas esperando validacion.'
      }
    ]
  });

  console.log('Seed listo. Password demo:', password);
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
