import React, { useEffect, useState, useRef } from 'react';
import './FeedbackMessage.css';

export enum FeedbackResult {
  success,
  almost,
  failure,
}

export interface FeedbackMessageProps {
  result: FeedbackResult;
  sentence: string;
  answer: string;
  onTryAgain: () => void;
  onNextQuestion: () => void;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  result,
  answer,
  onTryAgain,
  onNextQuestion,
}) => {
  const [emoji, setEmoji] = useState('');
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const tryAgainButtonRef = useRef<HTMLButtonElement>(null);
  const nextQuestionButtonRef = useRef<HTMLButtonElement>(null);
  const focusedButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Conditionally assign the closeButtonRef to the appropriate button
    if (result !== FeedbackResult.success) {
      focusedButtonRef.current = tryAgainButtonRef.current;
    } else {
      focusedButtonRef.current = nextQuestionButtonRef.current;
    }

    // Focus the assigned button if it exists
    focusedButtonRef.current?.focus();
  }, [result]);

  const getRandomEmoji = (emojiArray: string[]) => {
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  };

  useEffect(() => {
    const happyEmojis = ['😊', '😃', '🥳', '😄', '🎉'];
    const sadEmojis = ['😢', '😞', '😔', '🙁', '😟'];
    if ([FeedbackResult.success, FeedbackResult.almost].includes(result)) {
      setEmoji(getRandomEmoji(happyEmojis));
    } else {
      setEmoji(getRandomEmoji(sadEmojis));
    }
  }, [result]);

  const getTitleMessage = (result: FeedbackResult) => {
    switch (result) {
      case FeedbackResult.success:
        return 'Mandou bem!';
      case FeedbackResult.almost:
        return 'Quase!';
      case FeedbackResult.failure:
        return 'Tente novamente!';
    }
  };

  const revealAnswer = () => {
    setRevealedAnswer(`A resposta correta é: ${answer}"`);
  };

  const showRevealAnswerButton = (result: FeedbackResult) => {
    switch (result) {
      case FeedbackResult.almost:
      case FeedbackResult.failure:
        return true;
      case FeedbackResult.success:
        return false;
    }
  };

  const showTryAgainButton = (result: FeedbackResult) => {
    switch (result) {
      case FeedbackResult.almost:
      case FeedbackResult.failure:
        return true;
      case FeedbackResult.success:
        return false;
    }
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-container">
        <p>
          {getTitleMessage(result)} {emoji}
        </p>

        {revealedAnswer && <p>{revealedAnswer}</p>}

        {showRevealAnswerButton(result) && !revealedAnswer && (
          <button className="button" onClick={revealAnswer}>
            Revelar Resposta
          </button>
        )}

        {showTryAgainButton(result) && (
          <button
            className="button"
            onClick={onTryAgain}
            ref={tryAgainButtonRef}
          >
            Vou Tentar de Novo!
          </button>
        )}

        <button
          className="button"
          onClick={onNextQuestion}
          ref={nextQuestionButtonRef}
        >
          Próxima Pergunta!
        </button>
      </div>
    </div>
  );
};

export default FeedbackMessage;
