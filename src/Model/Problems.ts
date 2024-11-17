import * as ProblemLists from './verbs';

export const tenses = ['presente', 'pretérito perfeito', 'futuro'] as const;
export type Tense = (typeof tenses)[number];

export interface Problem {
  sentence: string;
  verb: string;
  tense: Tense;
  answers: string[];
}

export interface ProblemList {
  verb: string;
  problems: Problem[];
}

export const verbs: string[] = Object.keys(ProblemLists);
export const problemLists: ProblemList[] = Object.values(ProblemLists);
export const problems: Problem[] = problemLists.flatMap((problemList) => {
  return problemList.problems;
});
