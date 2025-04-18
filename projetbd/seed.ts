// prisma/seed.ts
import * as bcryptjs from 'bcryptjs';
import {prisma} from './lib/prisma';

async function main() {
  // Nettoyer la base de données (optionnel)
  await prisma.note.deleteMany();
  await prisma.soumission.deleteMany();
  await prisma.utilisateurRole.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.role.deleteMany();
  await prisma.sujet.deleteMany();

  console.log('Base de données nettoyée');

  // Créer les rôles
  const roleEtudiant = await prisma.role.create({
    data: {
      nom: 'etudiant',
      description: 'Compte étudiant standard avec accès limité',
    },
  });

  const roleProfesseur = await prisma.role.create({
    data: {
      nom: 'professeur',
      description: 'Compte enseignant avec accès aux cours et aux évaluations',
    },
  });

  const roleAdmin = await prisma.role.create({
    data: {
      nom: 'admin',
      description: 'Administrateur système avec tous les droits',
    },
  });

  console.log('Rôles créés');

  // Créer un administrateur
  const hashedAdminPassword = await bcryptjs.hash('admin123', 10);
  
  const admin = await prisma.utilisateur.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      nom: 'Admin',
      prenom: 'System',
      actif: true,
      date_creation: new Date(),
      roles: {
        create: {
          role_id: roleAdmin.id,
        },
      },
    },
  });

  console.log('Administrateur créé');

  // Créer 3 professeurs
  const professeurs = [];
  
  for (let i = 1; i <= 3; i++) {
    const hashedPassword = await bcryptjs.hash(`prof${i}`, 10);
    
    const professeur = await prisma.utilisateur.create({
      data: {
        email: `professeur${i}@example.com`,
        password: hashedPassword,
        nom: `Dupont`,
        prenom: `Prof ${i}`,
        Matricule: `PROF${i}00${i}`,
        actif: true,
        date_creation: new Date(),
        roles: {
          create: {
            role_id: roleProfesseur.id,
          },
        },
      },
    });
    
    professeurs.push(professeur);
  }

  console.log('Professeurs créés');

  // Créer 10 étudiants
  const etudiants = [];
  
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcryptjs.hash(`etudiant${i}`, 10);
    
    const etudiant = await prisma.utilisateur.create({
      data: {
        email: `etudiant${i}@example.com`,
        password: hashedPassword,
        nom: `Étudiant`,
        prenom: `Numéro ${i}`,
        Num_Etudiant: `ETU${i}00${i}`,
        actif: true,
        date_creation: new Date(),
        roles: {
          create: {
            role_id: roleEtudiant.id,
          },
        },
      },
    });
    
    etudiants.push(etudiant);
  }

  console.log('Étudiants créés');

  // Créer 5 sujets
  const sujets = [];
  const types = ['Exercice', 'Devoir', 'Projet', 'TP', 'Examen'];
  const titres = [
    'Introduction aux bases de données SQL',
    'Modélisation entité-association',
    'Requêtes avancées et jointures',
    'Normalisation et dénormalisation',
    'Performance et optimisation des requêtes'
  ];
  
  for (let i = 0; i < 5; i++) {
    const dateDepot = new Date();
    dateDepot.setDate(dateDepot.getDate() - Math.floor(Math.random() * 30));
    
    const dateDelai = new Date(dateDepot);
    dateDelai.setDate(dateDelai.getDate() + 14);
    
    const sujet = await prisma.sujet.create({
      data: {
        TypeDeSujet: types[i],
        DateDeDepot: dateDepot,
        Delai: dateDelai,
        Titre: titres[i],
        sousTitre: `Module ${i+1}`,
        Description: `Description détaillée du sujet ${i+1}. Ce sujet couvre les aspects fondamentaux du module.`,
        status: i < 3 ? 'Publié' : 'brouillon',
      },
    });
    
    sujets.push(sujet);
  }

  console.log('Sujets créés');

  // Créer des soumissions pour les étudiants
  for (let i = 0; i < 3; i++) { // Pour les 3 premiers sujets publiés
    for (let j = 0; j < 5; j++) { // Pour les 5 premiers étudiants
      const dateSoumission = new Date(sujets[i].DateDeDepot);
      dateSoumission.setDate(dateSoumission.getDate() + Math.floor(Math.random() * 10) + 1);
      
      // Vérifier que la date de soumission est avant la date limite
      if (dateSoumission > sujets[i].Delai) {
        dateSoumission.setDate(sujets[i].Delai.getDate() - 1);
      }
      
      await prisma.soumission.create({
        data: {
          etudiant_id: etudiants[j].id,
          sujet_id: sujets[i].id,
          commentaire: `Soumission pour le sujet ${i+1} par l'étudiant ${j+1}`,
          dateSoumission: dateSoumission,
        },
      });
    }
  }

  console.log('Soumissions créées');

  // Créer des notes pour les soumissions
  for (let i = 0; i < 3; i++) { // Pour les 3 premiers sujets publiés
    for (let j = 0; j < 5; j++) { // Pour les 5 premiers étudiants
      // Génération d'une note aléatoire entre 8 et 20
      const noteValue = (8 + Math.random() * 12).toFixed(2);
      
      await prisma.note.create({
        data: {
          etudiant_id: etudiants[j].id,
          sujet_id: sujets[i].id,
          Note: parseFloat(noteValue),
        },
      });
    }
  }

  console.log('Notes créées');

  // Créer un utilisateur pour le compte actuel
  const hashedCurrentUserPassword = await bcryptjs.hash('password123', 10);
  
  const currentUser = await prisma.utilisateur.create({
    data: {
      email: 'mamadoujuniorsy@gmail.com',
      password: hashedCurrentUserPassword,
      nom: 'Sy',
      prenom: 'Mamadou Junior',
      actif: true,
      date_creation: new Date('2025-04-18T10:35:52Z'),
      roles: {
        create: [
          {
            role_id: roleEtudiant.id,
          }
        ],
      },
    },
  });

  console.log('Utilisateur actuel créé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });