import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { Problem, problems } from './Model/Problems';
import { Definition, verbsDictionary } from './Model/Definitions';

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

  // If there are missing definitions, fail the test and report them
  if (missingVerbs.length > 0) {
    throw new Error(
      `Missing definitions for the following verbs: ${missingVerbs.join(', ')}`
    );
  }

  // If all definitions exist, the test passes
  expect(missingVerbs.length).toBe(0);
});
