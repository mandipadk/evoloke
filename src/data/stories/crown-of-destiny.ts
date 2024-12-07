import type { Scene } from '@/types/story';

export const crownOfDestinyScenes: Record<string, Scene> = {
  start: {
    id: 'start',
    title: 'The Empty Throne',
    content: "The ancient throne room stands silent, its towering stone walls bearing witness to centuries of royal decisions. As the last living heir to the crown, you find yourself standing before the empty throne, the weight of destiny heavy upon your shoulders.",
    choices: [
      {
        id: 'approach',
        text: "Approach the throne with reverence",
        nextScene: "throne_approach",
        consequences: {
          variables: { honor: 1 }
        }
      },
      {
        id: 'hesitate',
        text: "Hesitate and consider the implications",
        nextScene: "throne_hesitate",
        consequences: {
          variables: { influence: 1 }
        }
      }
    ]
  },
  throne_approach: {
    id: 'throne_approach',
    title: 'Approaching Destiny',
    content: "As you step closer, the ancient crown gleams atop its velvet cushion. The royal advisors watch intently, their expressions a mix of hope and uncertainty.",
    choices: [
      {
        id: 'take_crown',
        text: "Take the crown with confidence",
        nextScene: "crown_acceptance",
        consequences: {
          variables: { honor: 2 }
        }
      },
      {
        id: 'address_court',
        text: "Address the court first",
        nextScene: "court_address",
        consequences: {
          variables: { influence: 2 }
        }
      }
    ]
  },
  throne_hesitate: {
    id: 'throne_hesitate',
    title: 'A Moment of Doubt',
    content: "Your moment of contemplation doesn't go unnoticed. Whispers echo through the hall, some admiring your prudence, others questioning your resolve.",
    choices: [
      {
        id: 'assert',
        text: "Assert your right to consider carefully",
        nextScene: "assertion",
        consequences: {
          variables: { influence: 2, honor: -1 }
        }
      },
      {
        id: 'seek_counsel',
        text: "Seek counsel from the royal advisors",
        nextScene: "counsel",
        consequences: {
          variables: { honor: 1, influence: 1 }
        }
      }
    ]
  },
  crown_acceptance: {
    id: 'crown_acceptance',
    title: 'The Crown\'s Weight',
    content: "The weight of the crown settles upon your brow, and with it, the full magnitude of your responsibility becomes clear. The court erupts in a chorus of 'Long live the monarch!'",
    nextScene: "coronation_reflection",
  },
  coronation_reflection: {
    id: "coronation_reflection",
    title: 'A Legacy Begins',
    content: "As the cheers echo through the grand hall, time seems to slow. The crown's weight, both physical and metaphorical, reminds you of all those who wore it before. Generations of rulers, some remembered as wise and just, others as cruel and corrupt. Their legacy now intertwines with your own destiny.",
    nextScene: "first_decision",
  },
  first_decision: {
    id: "first_decision",
    title: 'The First Test',
    content: "The celebrations begin to quiet, and all eyes turn to you. This is the moment where your reign truly begins. The first of many decisions awaits.",
    choices: [
      {
        id: 'decree',
        text: "Make your first royal decree",
        nextScene: "first_decree",
        consequences: {
          variables: { influence: 2 }
        }
      },
      {
        id: 'tradition',
        text: "Honor the ancient traditions first",
        nextScene: "traditions",
        consequences: {
          variables: { honor: 2 }
        }
      }
    ]
  }
}; 