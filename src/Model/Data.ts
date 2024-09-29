export interface Definition {
  description: string;
  en: {
    translation: string;
    description: string;
  };
}

type Tense = 'presente' | 'pretérito perfeito';

export interface Problem {
  sentence: string;
  verb: string;
  tense: Tense;
  answer: string;
}

export const verbsDictionary: { [key: string]: Definition } = {
  beber: {
    description: 'Consumir líquidos ou bebidas.',
    en: {
      translation: 'to drink',
      description: 'To consume liquids or beverages.',
    },
  },
  ir: {
    description: 'Mover-se para outro lugar ou direção.',
    en: {
      translation: 'to go',
      description: 'To move to another place or direction.',
    },
  },
  trabalhar: {
    description:
      'Desempenhar uma atividade ou tarefa para alcançar um objetivo.',
    en: {
      translation: 'to work',
      description: 'To perform an activity or task to achieve a goal.',
    },
  },
  fazer: {
    description: 'Realizar uma ação, tarefa ou trabalho.',
    en: {
      translation: 'to do / to make',
      description: 'To perform an action, task, or job.',
    },
  },
  falar: {
    description: 'Comunicar-se através de palavras.',
    en: {
      translation: 'to speak / to talk',
      description: 'To communicate through words.',
    },
  },
  entender: {
    description: 'Compreender algo ou alguém.',
    en: {
      translation: 'to understand',
      description: 'To comprehend something or someone.',
    },
  },
  ler: {
    description: 'Interpretar um texto escrito.',
    en: {
      translation: 'to read',
      description: 'To interpret a written text.',
    },
  },
  ficar: {
    description: 'Permanecer em um local ou estado.',
    en: {
      translation: 'to stay / to remain',
      description: 'To remain in a place or state.',
    },
  },
  vir: {
    description: 'Mover-se de um lugar para outro em direção a quem fala.',
    en: {
      translation: 'to come',
      description: 'To move from one place to another towards the speaker.',
    },
  },
  pensar: {
    description: 'Refletir ou considerar algo com a mente.',
    en: {
      translation: 'to think',
      description: 'To reflect or consider something mentally.',
    },
  },
  comprar: {
    description: 'Adquirir algo em troca de dinheiro.',
    en: {
      translation: 'to buy',
      description: 'To acquire something in exchange for money.',
    },
  },
  discutir: {
    description: 'Debater ou argumentar sobre um tema ou assunto.',
    en: {
      translation: 'to discuss',
      description: 'To debate or argue about a topic or subject.',
    },
  },
  começar: {
    description: 'Iniciar algo novo ou dar início a uma ação.',
    en: {
      translation: 'to start / to begin',
      description: 'To start something new or initiate an action.',
    },
  },
  enviar: {
    description: 'Mandar ou remeter algo para alguém.',
    en: {
      translation: 'to send',
      description: 'To send or forward something to someone.',
    },
  },
  preparar: {
    description: 'Organizar ou arranjar algo com antecedência.',
    en: {
      translation: 'to prepare',
      description: 'To organize or arrange something in advance.',
    },
  },
  morar: {
    description: 'Residir ou viver em um determinado lugar.',
    en: {
      translation: 'to live / to reside',
      description: 'To reside or live in a specific place.',
    },
  },
  descansar: {
    description: 'Relaxar e recuperar as energias.',
    en: {
      translation: 'to rest',
      description: 'To relax and recover energy.',
    },
  },
  participar: {
    description: 'Tomar parte em uma atividade ou evento.',
    en: {
      translation: 'to participate',
      description: 'To take part in an activity or event.',
    },
  },
};

export const problems: Problem[] = [
  {
    sentence: 'Eu {blank} café todas as manhãs.',
    verb: 'beber',
    tense: 'presente',
    answer: 'bebo',
  },
  {
    sentence: 'Ela {blank} ao trabalho de carro.',
    verb: 'ir',
    tense: 'presente',
    answer: 'vai',
  },
  {
    sentence: 'Nós {blank} muito no final de semana passado.',
    verb: 'trabalhar',
    tense: 'pretérito perfeito',
    answer: 'trabalhamos',
  },
  {
    sentence: 'Eles {blank} as tarefas antes de dormir.',
    verb: 'fazer',
    tense: 'presente',
    answer: 'fazem',
  },
  {
    sentence: 'Você {blank} com seus pais ontem?',
    verb: 'falar',
    tense: 'pretérito perfeito',
    answer: 'falou',
  },
  {
    sentence: 'Eu não {blank} o que aconteceu.',
    verb: 'entender',
    tense: 'presente',
    answer: 'entendo',
  },
  {
    sentence: 'Nós {blank} um novo livro toda semana.',
    verb: 'ler',
    tense: 'presente',
    answer: 'lemos',
  },
  {
    sentence: 'Ele {blank} em casa durante as férias.',
    verb: 'ficar',
    tense: 'pretérito perfeito',
    answer: 'ficou',
  },
  {
    sentence: 'Você {blank} para a festa?',
    verb: 'vir',
    tense: 'presente',
    answer: 'vem',
  },
  {
    sentence: 'Ela {blank} tudo antes de decidir.',
    verb: 'pensar',
    tense: 'presente',
    answer: 'pensa',
  },
  {
    sentence: 'Eu {blank} para a academia todos os dias.',
    verb: 'ir',
    tense: 'presente',
    answer: 'vou',
  },
  {
    sentence: 'Nós {blank} uma casa nova no ano passado.',
    verb: 'comprar',
    tense: 'pretérito perfeito',
    answer: 'compramos',
  },
  {
    sentence: 'Eles {blank} sobre o problema durante a reunião.',
    verb: 'discutir',
    tense: 'pretérito perfeito',
    answer: 'discutiram',
  },
  {
    sentence: 'Ela {blank} um novo curso na universidade.',
    verb: 'começar',
    tense: 'pretérito perfeito',
    answer: 'começou',
  },
  {
    sentence: 'Você {blank} o documento no e-mail?',
    verb: 'enviar',
    tense: 'pretérito perfeito',
    answer: 'enviou',
  },
  {
    sentence: 'Eu {blank} feliz por ver você novamente.',
    verb: 'ficar',
    tense: 'presente',
    answer: 'fico',
  },
  {
    sentence: 'Nós {blank} um almoço especial para o aniversário dele.',
    verb: 'preparar',
    tense: 'pretérito perfeito',
    answer: 'preparamos',
  },
  {
    sentence: 'Eles {blank} em um apartamento no centro.',
    verb: 'morar',
    tense: 'presente',
    answer: 'moram',
  },
  {
    sentence: 'Ela {blank} muito durante o fim de semana.',
    verb: 'descansar',
    tense: 'pretérito perfeito',
    answer: 'descansou',
  },
  {
    sentence: 'Você {blank} na apresentação de hoje?',
    verb: 'participar',
    tense: 'pretérito perfeito',
    answer: 'participou',
  },
];
