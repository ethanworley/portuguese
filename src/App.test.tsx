import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Problem, problems } from './Model/Problems';
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
    if (!verbsDictionary[problem.verb]) {
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

test('checks that sentences contain at least one keyword', () => {
  const missingKeywordSentences: string[] = [];

  problems.forEach((problem) => {
    if (addKeywords(problem.sentence).count == 0) {
      missingKeywordSentences.push(problem.sentence);
    }
  });

  if (missingKeywordSentences.length > 0) {
    throw new Error(
      `Missing keywords in the following sentences:\n${missingKeywordSentences.join('\n')}`
    );
  }

  expect(missingKeywordSentences.length).toBe(0);
});

const prettyPrintProblem = (problem: Problem): string => {
  return `{ sentence: "${problem.sentence}", verb: "${problem.verb}", tense: ${problem.tense}, answers: ["${problem.answers.join('", "')}"] }`;
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
      `Missing keywords in the following sentences:\n${missingAnswersProblems.map(prettyPrintProblem).join('\n')}`
    );
  }

  expect(missingAnswersProblems.length).toBe(0);
});

/*
test('pretty print all problems', () => {
  throw new Error(
    `Current problems:\n${problems.map(prettyPrintProblem).join(',\n')}`
  );
});
*/
