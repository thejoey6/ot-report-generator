import { PrismaClient } from '../generated/prisma/client.js';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding base suggestions...');

  const systemUserId = 10;

  const baseSuggestions = [
  // Birth History - Delivery Type
  { category: 'birthHistory', fieldName: 'deliveryType', suggestionText: 'vaginal delivery',  },
  { category: 'birthHistory', fieldName: 'deliveryType', suggestionText: 'cesarean section',  },
  { category: 'birthHistory', fieldName: 'deliveryType', suggestionText: 'vacuum-assisted delivery',  },
  { category: 'birthHistory', fieldName: 'deliveryType', suggestionText: 'forceps-assisted delivery',  },

  // Birth History - Term
  { category: 'birthHistory', fieldName: 'term', suggestionText: 'full term',  },
  { category: 'birthHistory', fieldName: 'term', suggestionText: '35 weeks',  },
  { category: 'birthHistory', fieldName: 'term', suggestionText: '36 weeks',  },
  { category: 'birthHistory', fieldName: 'term', suggestionText: '37 weeks',  },

  // Birth History - Diagnosis
  { category: 'birthHistory', fieldName: 'diagnosis', suggestionText: 'no known diagnosis',  },
  { category: 'birthHistory', fieldName: 'diagnosis', suggestionText: 'autism spectrum disorder', },
  { category: 'birthHistory', fieldName: 'diagnosis', suggestionText: 'global developmental delay', },
  { category: 'birthHistory', fieldName: 'diagnosis', suggestionText: 'speech and language delay', },
  { category: 'birthHistory', fieldName: 'diagnosis', suggestionText: 'Down syndrome', },

  // Background Information - Allergies
  { category: 'backgroundInformation', fieldName: 'allergies', suggestionText: 'No known allergies',  },
  { category: 'backgroundInformation', fieldName: 'allergies', suggestionText: 'No known drug allergies', },
  { category: 'backgroundInformation', fieldName: 'allergies', suggestionText: 'Penicillin', },
  { category: 'backgroundInformation', fieldName: 'allergies', suggestionText: 'Seasonal allergies', },

  // Summary - Recommendations
  { category: 'summary', fieldName: 'recommendations', suggestionText: 'Speech-language therapy 2x weekly',  },
  { category: 'summary', fieldName: 'recommendations', suggestionText: 'Occupational therapy for sensory integration', },
  { category: 'summary', fieldName: 'recommendations', suggestionText: 'Physical therapy 1x weekly', },
  { category: 'summary', fieldName: 'recommendations', suggestionText: 'Parent training and support', },
  { category: 'summary', fieldName: 'recommendations', suggestionText: 'Continue early intervention services', },
  ];

  await prisma.userSuggestion.createMany({
  data: baseSuggestions.map(s => ({
  ...s,
  userId: systemUserId,   // can be null if schema allows
  usageCount: 1,
  isPinned: false,
  })),
  skipDuplicates: true,
  });

  console.log(`Seeded ${baseSuggestions.length} base user suggestions`);
}

main()
  .catch((error) => {
  console.error(' Seeding failed:', error);
  process.exit(1);
  })
  .finally(() => prisma.$disconnect());
