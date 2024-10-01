import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Definition, verbsDictionary, keywords } from './Model/Definitions';
import { Problem, problems, Tense } from './Model/Problems';
import Tooltip from './Components/Tooltip';
import FeedbackMessage, { FeedbackResult } from './Components/FeedbackMessage';
import { ReactComponent as SettingsIcon } from './settingsicon.svg';
import SettingsMenu from './Components/SettingsMenu';

const locale = 'pt-BR';

export interface KeywordResult {
  sentence: JSX.Element;
  count: number;
}

export const addKeywords = (
  sentence: string,
  inputRef?: React.RefObject<HTMLInputElement>
): KeywordResult => {
  const words = sentence.split(' ');
  const sentenceElements: (JSX.Element | string)[] = [];
  var count = 0;

  words.forEach((word, index) => {
    const match = word.match(/(\p{L}+)(\p{P}*)/u);
    const actualWord = match ? match[1].toLocaleLowerCase(locale) : word;
    const punctuation = match ? match[2] : '';

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
  const [tenseState, setTenseState] = useState<Record<Tense, boolean>>({
    presente: true,
    'pretérito perfeito': true,
    futuro: true,
  });

  const getNewProblem = () => {
    const filteredProblems = problems.filter(
      (problem) => tenseState[problem.tense as Tense]
    );
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
  };

  const toggleTense = (tense: Tense) => {
    setTenseState((prevState) => ({
      ...prevState,
      [tense]: !prevState[tense],
    }));
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
  }, []);

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
            <SettingsIcon />
          </button>
          {isSettingsOpen && (
            <SettingsMenu tenseState={tenseState} toggleTense={toggleTense} />
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
    </div>
  );
}

export default App;
