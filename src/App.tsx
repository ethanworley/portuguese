import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Definition, verbsDictionary, keywords } from './Model/Definitions';
import { Problem, problems } from './Model/Problems';
import Tooltip from './Components/Tooltip';
import FeedbackMessage from './Components/FeedbackMessage';

const locale = 'pt-BR';

export interface KeywordResult {
  sentence: JSX.Element;
  count: number;
}

export const addKeywords = (sentence: string): KeywordResult => {
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
    success: boolean;
    visible: boolean;
  }>({
    success: true,
    visible: false,
  });

  const getNewProblem = () => {
    const randomIndex = Math.floor(Math.random() * problems.length);
    const problem = problems[randomIndex];
    const definition = verbsDictionary[problem.verb];
    const viewModel = {
      sentence: addKeywords(problem.sentence).sentence,
      problem: problem,
      definition: definition,
    };

    setCurrentViewModel(viewModel);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const checkAnswer = () => {
    const currentValue = inputRef.current?.value;
    if (currentValue == null || currentViewModel == null) {
      return;
    }

    const isCorrect = currentValue === currentViewModel.problem.answer;
    if (isCorrect) {
      setFeedback({
        success: true,
        visible: true,
      });
      getNewProblem();
    } else {
      setFeedback({
        success: false,
        visible: true,
      });
    }
  };

  useEffect(() => {
    getNewProblem();
  }, []);

  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, visible: false }));
    inputRef.current?.focus();
  };

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={checkAnswer} style={{ padding: '20px' }}>
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
          success={feedback.success}
          answer={currentViewModel?.problem.answer ?? ''} // Pass the correct answer to FeedbackMessage
          onClose={closeFeedback} // Pass the close
        />
      )}
    </div>
  );
}

export default App;
