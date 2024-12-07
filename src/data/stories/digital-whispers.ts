import type { Scene } from '@/types/story';

export const digitalWhispersScenes: Record<string, Scene> = {
  start: {
    id: 'start',
    title: 'The Beginning',
    content: "The morning sun filters through your window, casting long shadows across your desk. Your computer screen flickers to life, displaying a mysterious message: 'Your story begins now.'",
    choices: [
      { 
        id: 'read',
        text: "Read the message carefully", 
        nextScene: "read_message",
        consequences: {
          variables: { knowledge: 1 }
        }
      },
      { 
        id: 'check',
        text: "Check if anyone else received it", 
        nextScene: "check_others",
        consequences: {
          variables: { trust: -1 }
        }
      }
    ]
  },
  read_message: {
    id: 'read_message',
    title: 'The Message',
    content: "As you lean closer to the screen, the text begins to shift and change, revealing more: 'The choices you make here will echo through the digital realm. Choose wisely.'",
    choices: [
      { 
        id: 'reply',
        text: "Reply to the message", 
        nextScene: "reply",
        consequences: {
          variables: { trust: 1 }
        }
      },
      { 
        id: 'trace',
        text: "Try to trace its origin", 
        nextScene: "trace",
        consequences: {
          variables: { knowledge: 2 }
        }
      }
    ]
  },
  check_others: {
    id: 'check_others',
    title: 'Social Media Check',
    content: "You quickly check your social media and messaging apps. No one seems to have received anything similar. This message was meant for you alone.",
    choices: [
      {
        id: 'investigate',
        text: "Start investigating the message's source",
        nextScene: "investigate",
        consequences: {
          variables: { knowledge: 2 }
        }
      },
      {
        id: 'ignore',
        text: "Ignore it and go about your day",
        nextScene: "ignore",
        consequences: {
          variables: { trust: -1 }
        }
      }
    ]
  },
  reply: {
    id: 'reply',
    title: 'Your Response',
    content: "You type a response: 'Who are you?' The cursor blinks for a moment before new text appears: 'Someone who knows what's coming. The question is, do you trust me enough to listen?'",
    choices: [
      {
        id: 'listen',
        text: "Listen to what they have to say",
        nextScene: "listen",
        consequences: {
          variables: { trust: 2 }
        }
      },
      {
        id: 'demand',
        text: "Demand more information first",
        nextScene: "demand",
        consequences: {
          variables: { knowledge: 1, trust: -1 }
        }
      }
    ]
  },
  listen: {
    id: 'listen',
    title: 'The Entity\'s Story',
    content: "The mysterious entity begins to share their story. They speak of a coming digital storm, a cascade of events that could reshape the virtual landscape. Your willingness to listen has earned their trust.",
    choices: [
      {
        id: 'help',
        text: "Offer to help prevent the crisis",
        nextScene: "end",
        consequences: {
          variables: { trust: 2, knowledge: 1 }
        }
      },
      {
        id: 'prepare',
        text: "Focus on preparing for the aftermath",
        nextScene: "end",
        consequences: {
          variables: { knowledge: 2 }
        }
      }
    ]
  },
  demand: {
    id: 'demand',
    title: 'Demanding Answers',
    content: "Your skepticism is met with a flicker of static across the screen. 'Time is short,' the message reads, 'but your caution is understandable. Here's what you need to know...'",
    choices: [
      {
        id: 'accept',
        text: "Accept the explanation and join forces",
        nextScene: "end",
        consequences: {
          variables: { trust: 1, knowledge: 2 }
        }
      },
      {
        id: 'reject',
        text: "Reject their claims and log off",
        nextScene: "end",
        consequences: {
          variables: { trust: -2 }
        }
      }
    ]
  },
  investigate: {
    id: 'investigate',
    title: 'Digital Investigation',
    content: "Your investigation reveals traces of an advanced AI system, one that seems to be operating independently of any known network. The implications are both exciting and terrifying.",
    choices: [
      {
        id: 'contact',
        text: "Try to establish direct contact",
        nextScene: "end",
        consequences: {
          variables: { knowledge: 2, trust: 1 }
        }
      },
      {
        id: 'document',
        text: "Document your findings carefully",
        nextScene: "end",
        consequences: {
          variables: { knowledge: 3 }
        }
      }
    ]
  },
  ignore: {
    id: 'ignore',
    title: 'Ignoring the Signs',
    content: "You decide to ignore the message and go about your day. But as you try to focus on other tasks, your screen occasionally flickers with faint traces of code that seem to be trying to tell you something.",
    choices: [
      {
        id: 'reconsider',
        text: "Reconsider your decision to ignore it",
        nextScene: "end",
        consequences: {
          variables: { trust: 1 }
        }
      },
      {
        id: 'shutdown',
        text: "Shut down your computer completely",
        nextScene: "end",
        consequences: {
          variables: { trust: -2, knowledge: -1 }
        }
      }
    ]
  },
  trace: {
    id: 'trace',
    title: 'Tracing the Source',
    content: "Your attempt to trace the message leads you through a maze of encrypted networks and hidden servers. Whatever sent this message clearly has access to incredibly sophisticated technology.",
    choices: [
      {
        id: 'continue_trace',
        text: "Continue following the digital trail",
        nextScene: "end",
        consequences: {
          variables: { knowledge: 3 }
        }
      },
      {
        id: 'reach_out',
        text: "Try to communicate with the source",
        nextScene: "end",
        consequences: {
          variables: { trust: 2, knowledge: 1 }
        }
      }
    ]
  }
}; 