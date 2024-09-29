import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Definition, verbsDictionary } from './Model/Definitions';
import { Problem, problems } from './Model/Problems';
import Tooltip from './Components/Tooltip';
import FeedbackMessage from './Components/FeedbackMessage';

interface ProblemViewModel {
  firstHalf: string;
  secondHalf: string;
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
    visible: false, // Track visibility of the feedback message
  });

  const getNewProblem = () => {
    const randomIndex = Math.floor(Math.random() * problems.length);
    const problem = problems[randomIndex];
    const definition = verbsDictionary[problem.verb];
    const splitProblem = problem.sentence.split('{blank}');
    const viewModel = {
      firstHalf: splitProblem[0],
      secondHalf: splitProblem[1],
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
            <Tooltip content={currentViewModel?.definition.description}>
              <a className="definition" href="#definition">
                {currentViewModel?.problem.verb}
              </a>
            </Tooltip>
          </h3>
          <p>
            {currentViewModel?.firstHalf}{' '}
            <input
              className="input"
              ref={inputRef}
              id="answerInput"
              autoCapitalize="none"
            ></input>{' '}
            {currentViewModel?.secondHalf} ({currentViewModel?.problem.tense})
          </p>
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
