import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import { Definition, verbsDictionary, keywords } from './Model/Definitions';
import { Problem, problems, Tense, tenses } from './Model/Problems';
import * as Verbs from './Model/verbs';
import Tooltip from './Components/Tooltip';
import FeedbackMessage, { FeedbackResult } from './Components/FeedbackMessage';
import { ReactComponent as SettingsIcon } from './settingsicon.svg';
import SettingsMenu from './Components/SettingsMenu';

export const locale = 'pt-BR';

export interface KeywordResult {
  sentence: JSX.Element;
  count: number;
}

function numberToLetters(n: number): string {
  let result = '';

  while (n >= 0) {
    const remainder = n % 26;
    result = String.fromCharCode(remainder + 97) + result; // 97 is the ASCII code for 'a'
    n = Math.floor(n / 26) - 1; // Adjust for zero-based indexing
  }

  return result;
}

export const addKeywords = (
  sentence: string,
  inputRef?: React.RefObject<HTMLInputElement>
): KeywordResult => {
  const keywordRegex = /\[([^\]]+)\]/g; // matches [arbitrary keyword] in a sentence
  const arbitraryKeywords: { [placeholder: string]: string } = {};
  let modifiedSentence = sentence;
  let match;
  let placeholderIndex = 0;

  while ((match = keywordRegex.exec(sentence)) !== null) {
    const fullMatch = match[0];
    const keywordPhrase = match[1];
    // e.g. arbitrarykeyworda through arbitrarykeywordz
    const placeholder = `arbitrarykeyword${numberToLetters(placeholderIndex)}`;

    modifiedSentence = modifiedSentence.replace(fullMatch, placeholder);

    arbitraryKeywords[placeholder] = keywordPhrase.toLocaleLowerCase(locale);

    placeholderIndex++;
  }

  sentence = modifiedSentence;

  const words = sentence.split(' ');
  const sentenceElements: (JSX.Element | string)[] = [];
  var count = 0;

  words.forEach((word, index) => {
    const match = word.match(/(\p{L}+)(\p{P}*)/u);
    let actualWord = match ? match[1].toLocaleLowerCase(locale) : word;
    const punctuation = match ? match[2] : '';
    const arbitraryKeyword = arbitraryKeywords[actualWord];

    if (arbitraryKeyword) {
      actualWord = arbitraryKeyword;
    }

    if (keywords[actualWord]) {
      count++;
      sentenceElements.push(
        <Tooltip
          key={`tooltip-${index}`}
          word={actualWord}
          definition={keywords[actualWord]}
        >
          {actualWord}
        </Tooltip>
      );
      sentenceElements.push(punctuation);
    } else if (word === '{blank}') {
      sentenceElements.push(
        <input
          key="answerInput"
          className="input"
          id="answerInput"
          autoCapitalize="none"
          ref={inputRef}
        ></input>
      );
    } else {
      sentenceElements.push(word);
    }

    if (index < words.length - 1) {
      sentenceElements.push(' ');
    }
  });

  return { sentence: <>{sentenceElements}</>, count: count };
};

interface ProblemViewModel {
  sentence: JSX.Element;
  problem: Problem;
  definition: Definition;
}

function App() {
  const [currentViewModel, setCurrentViewModel] = useState<ProblemViewModel>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    result: FeedbackResult;
    visible: boolean;
  }>({
    result: FeedbackResult.success,
    visible: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [tenseState, setTenseState] = useState<Record<Tense, boolean>>(() => {
    return tenses.reduce(
      (record, tense) => {
        record[tense] = true;
        return record;
      },
      {} as Record<Tense, boolean>
    );
  });

  const [verbState, setVerbState] = useState<Record<string, boolean>>(() => {
    return Object.keys(Verbs).reduce(
      (record, verb) => {
        record[verb] = true;
        return record;
      },
      {} as Record<string, boolean>
    );
  });

  const filteredProblems = useMemo(() => {
    return problems
      .filter((problem) => tenseState[problem.tense as Tense])
      .filter((problem) => verbState[problem.verb] ?? true);
  }, [tenseState, verbState]);

  const getNewProblem = useCallback(() => {
    if (filteredProblems.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const problem = filteredProblems[randomIndex];
    const definition = verbsDictionary[problem.verb];
    const viewModel = {
      sentence: addKeywords(problem.sentence, inputRef).sentence,
      problem: problem,
      definition: definition,
    };

    setCurrentViewModel(viewModel);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }, [filteredProblems, inputRef]);

  const toggleTense = (tense: Tense) => {
    setTenseState((prevState) => ({
      ...prevState,
      [tense]: !prevState[tense],
    }));
  };

  const toggleVerb = (verb: string) => {
    setVerbState((prevState) => ({
      ...prevState,
      [verb]: !prevState[verb],
    }));
  };
  const selectAllVerbs = () => {
    for (const verb in Verbs) {
      setVerbState((prevState) => ({
        ...prevState,
        [verb]: true,
      }));
    }
  };
  const deselectAllVerbs = () => {
    for (const verb in Verbs) {
      setVerbState((prevState) => ({
        ...prevState,
        [verb]: false,
      }));
    }
  };

  const normalizeAnswer = (text: string) => {
    return text.normalize('NFD').trim().toLowerCase();
  };

  const stripDiacritics = (text: string) => {
    return text.replace(/[\u0300-\u036f]/g, '');
  };

  const checkAnswer = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const currentValue = inputRef.current?.value;
    if (currentValue == null || currentViewModel == null) {
      return;
    }

    const { answers } = currentViewModel.problem;

    const normalizedUserAnswer = normalizeAnswer(currentValue);
    const normalizedCorrectAnswers = answers.map(normalizeAnswer);

    const isCorrect = normalizedCorrectAnswers.includes(normalizedUserAnswer);

    const strippedUserAnswer = stripDiacritics(
      currentValue.trim().toLowerCase()
    );
    const isAlmostCorrect =
      !isCorrect &&
      normalizedCorrectAnswers.some(
        (normalizedAnswer) =>
          stripDiacritics(normalizedAnswer) === strippedUserAnswer
      );

    var result: FeedbackResult;
    if (isCorrect) {
      result = FeedbackResult.success;
    } else if (isAlmostCorrect) {
      result = FeedbackResult.almost;
    } else {
      result = FeedbackResult.failure;
    }

    setFeedback({
      result: result,
      visible: true,
    });
  };

  useEffect(() => {
    getNewProblem();
  }, [getNewProblem]);

  const closeFeedback = (shouldGetNewProblem: boolean) => () => {
    if (shouldGetNewProblem) getNewProblem();
    setFeedback((prev) => ({ ...prev, visible: false }));
    inputRef.current?.focus();
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="settings-container">
          <button
            className="settings-button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <SettingsIcon className="settings-icon" />
          </button>
          {isSettingsOpen && (
            <SettingsMenu
              tenseState={tenseState}
              toggleTense={toggleTense}
              verbState={verbState}
              toggleVerb={toggleVerb}
              selectAllVerbs={selectAllVerbs}
              deselectAllVerbs={deselectAllVerbs}
            />
          )}
        </div>
        <form
          autoComplete="off"
          onSubmit={(e) => checkAnswer(e)}
          style={{ padding: '20px' }}
        >
          <h3>
            <Tooltip
              word={currentViewModel?.problem.verb ?? ''}
              definition={currentViewModel?.definition}
            >
              {currentViewModel?.problem.verb}
            </Tooltip>
          </h3>
          <div>
            {currentViewModel?.sentence}
            <br />({currentViewModel?.problem.tense})
          </div>
        </form>

        <div className="button-container">
          <button className="button" onClick={() => checkAnswer()}>
            Conferir Resposta
          </button>
          <button className="button" onClick={() => getNewProblem()}>
            Nova Frase
          </button>
        </div>
      </header>

      {feedback.visible && (
        <FeedbackMessage
          result={feedback.result}
          answer={currentViewModel?.problem.answers.join('/') ?? ''}
          sentence={currentViewModel?.problem.sentence ?? ''}
          onNextQuestion={closeFeedback(true)}
          onTryAgain={closeFeedback(false)}
        />
      )}

      <footer className="App-footer">{filteredProblems.length} frases</footer>
    </div>
  );
}

export default App;
