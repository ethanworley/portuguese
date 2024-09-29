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

test('checks the definitions exist', () => {
  problems.forEach((problem) => {
    expect(verbsDictionary[problem.verb]).not.toBeNull();
  });
});
