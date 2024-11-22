import React from 'react';
import { render, screen } from '@testing-library/react';
import App, { locale } from './App';
import {
  Problem,
  ProblemList,
  problems,
  problemLists,
  tenses,
  Tense,
} from './Model/Problems';
import { Definition, verbsDictionary, keywords } from './Model/Definitions';
import { addKeywords } from './App';

test('renders Nova Frase button', () => {
  render(<App />);
  const buttonText = screen.getByText(/Nova Frase/i);
  expect(buttonText).toBeInTheDocument();
});

test('checks that definitions exist for all verbs used in problems', () => {
  const missingVerbs: string[] = [];

  problems.forEach((problem) => {
    if (
      !verbsDictionary[problem.verb] &&
      !missingVerbs.includes(problem.verb)
    ) {
      missingVerbs.push(problem.verb);
    }
  });

  if (missingVerbs.length > 0) {
    throw new Error(
      `Missing definitions for the following verbs: ${missingVerbs.join(', ')}`
    );
  }

  expect(missingVerbs.length).toBe(0);
});

test('checks that definitions exist for all keywords', () => {
  const missingDefinitions: string[] = [];

  Object.keys(keywords).forEach((keyword) => {
    if (!keywords[keyword]) {
      missingDefinitions.push(keyword);
    }
  });

  if (missingDefinitions.length > 0) {
    throw new Error(
      `Missing definitions for the following keywords: ${missingDefinitions.join(', ')}\n\n${missingDefinitions.length} missing definition(s).`
    );
  }

  expect(missingDefinitions.length).toBe(0);
});

test('checks sentences with special case keywords have special case decorations', () => {
  const specialCaseCharacters = [' ', '-'];
  const specialCaseKeywords = Object.keys(keywords).filter((keyword) => {
    for (const character of specialCaseCharacters) {
      if (keyword.includes(character)) {
        return true;
      }
    }
    return false;
  });

  const missingSentences = problems
    .map((problem) => problem.sentence)
    .filter((problemSentence) => {
      for (const keyword of specialCaseKeywords) {
        if (problemSentence.includes(keyword)) {
          return true;
        }
      }
      return false;
    })
    .filter((problemSentence) => {
      var isValid = true;
      for (const keyword of specialCaseKeywords) {
        isValid = problemSentence.includes(keyword) && isValid;
      }
      return isValid;
    });

  if (missingSentences.length > 0) {
    throw new Error(
      `Missing decoration for the following sentences: ${missingSentences.join('\n')}\n\n${missingSentences.length} missing decoration(s).`
    );
  }

  expect(missingSentences.length).toBe(0);
});

test('checks that sentences do not contain Tu', () => {
  const tuSentences: string[] = [];

  problems.forEach((problem) => {
    const words = problem.sentence.toLocaleLowerCase(locale).split(' ');
    if (words.includes('tu')) {
      tuSentences.push(problem.sentence);
    }
  });

  if (tuSentences.length > 0) {
    throw new Error(
      `Tu found in the following sentences:\n${tuSentences.join('\n')}\n\n${tuSentences.length} tu sentence(s).`
    );
  }

  expect(tuSentences.length).toBe(0);
});

test('checks that sentences contain at least one keyword', () => {
  const missingKeywordSentences: string[] = [];

  problems.forEach((problem) => {
    if (addKeywords(problem.sentence).count == 0) {
      missingKeywordSentences.push(problem.sentence);
    }
  });

  if (missingKeywordSentences.length > 0) {
    throw new Error(
      `Missing keywords in the following sentences:\n${missingKeywordSentences.join('\n')}\n\n${missingKeywordSentences.length} sentence(s) missing keywords.`
    );
  }

  expect(missingKeywordSentences.length).toBe(0);
});

const prettyPrintProblem = (problem: Problem): string => {
  return `{ sentence: '${problem.sentence}', verb: '${problem.verb}', tense: '${problem.tense}', answers: ['${problem.answers.join("', '")}'] }`;
};

test('checks that future tense questions contain at least two answers', () => {
  const missingAnswersProblems: Problem[] = [];

  problems.forEach((problem) => {
    if (problem.tense === 'futuro' && problem.answers.length < 2) {
      missingAnswersProblems.push(problem);
    }
  });

  if (missingAnswersProblems.length > 0) {
    throw new Error(
      `Missing answers in the following sentences:\n${missingAnswersProblems.map(prettyPrintProblem).join('\n')}`
    );
  }

  expect(missingAnswersProblems.length).toBe(0);
});

test('checks that verbs each have at least 10 problems per tense', () => {
  interface MissingVerbTenses {
    verb: string;
    tenses: Tense[];
    counts: number[];
  }

  const missingProblemVerbs: { [key: string]: MissingVerbTenses } = {};

  const prettyPrintMissingVerbTenses = (
    missingVerbTenses: MissingVerbTenses
  ) => {
    let tenseList = [];
    for (var i = 0; i < missingVerbTenses.tenses.length; i++) {
      tenseList.push(
        `${missingVerbTenses.tenses[i]}: ${missingVerbTenses.counts[i]}`
      );
    }
    return `${missingVerbTenses.verb}: (${tenseList.join(', ')})`;
  };

  problemLists.forEach((problemList) => {
    tenses.forEach((tense) => {
      const problemCount = problemList.problems.filter((problem) => {
        return problem.tense === tense;
      }).length;
      if (problemCount < 10) {
        if (Object.keys(missingProblemVerbs).indexOf(problemList.verb) === -1) {
          missingProblemVerbs[problemList.verb] = {
            verb: problemList.verb,
            tenses: [],
            counts: [],
          };
        }
        let verbMissingTenses = missingProblemVerbs[problemList.verb];
        verbMissingTenses.tenses.push(tense);
        verbMissingTenses.counts.push(problemCount);
        missingProblemVerbs[problemList.verb] = verbMissingTenses;
      }
    });
  });

  if (Object.keys(missingProblemVerbs).length > 0) {
    throw new Error(
      `Missing problems for the following verbs:\n${Object.values(missingProblemVerbs).map(prettyPrintMissingVerbTenses).join('\n')}`
    );
  }

  expect(Object.keys(missingProblemVerbs).length).toBe(0);
});
/*
import * as ProblemLists from './Model/verbs';
import * as fs from 'fs';
import * as path from 'path';

const prettyPrintIndex = (verb: string): string => {
  return `export * from './${verb}';`;
};

test('transform problems', () => {
  const existingLists = ProblemLists as Record<string, ProblemList>;
  let verbs: string[] = [];
  Object.keys(existingLists).forEach((verb) => {
    verbs.push(verb);
  });

  let problemListDictionary: { [key: string]: ProblemList } = {};
  let count = 0;
  problems.forEach((problem) => {
    const verb = problem.verb;
    if (verbs.indexOf(verb) === -1) {
      verbs.push(verb);
    }
    const existingSentences = existingLists[verb]?.problems.map((problem) => {
      return problem.sentence;
    });
    if (existingSentences?.indexOf(problem.sentence) >= 0) {
      return;
    }

    var problemList = problemListDictionary[verb];
    if (!problemList) {
      problemList = { verb: verb, problems: [] };
    }
    problemList.problems.push(problem);
    problemListDictionary[verb] = problemList;
  });
  for (let verb in problemListDictionary) {
    const logLine = `import { ProblemList } from '../Problems';

export const ${verb}: ProblemList = {
  verb: '${verb}',
  problems: [
    ${problemListDictionary[verb].problems.map(prettyPrintProblem).join(',\n')}
  ]
}`;
    console.log(logLine);
    //const filePath = path.join(verbsDir, `${verb}.ts`);
    //fs.writeFileSync(`./src/Model/verbs/${verb}.ts`, logLine);
    count++;
  }
  console.log(count);

  verbs.sort();
  console.log(verbs.map(prettyPrintIndex).join('\n'));
});

test('pretty print all problems', () => {
  throw new Error(
    `Current problems:\n${problems.map(prettyPrintProblem).join(',\n')}`
  );
});
*/
