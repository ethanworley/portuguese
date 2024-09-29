// FeedbackMessage.tsx
import React, { useEffect, useState, useRef } from 'react';
import './FeedbackMessage.css';

// Define the type for the props of the FeedbackMessage component
export interface FeedbackMessageProps {
  success: boolean;
  answer: string; // The correct answer to be revealed
  onClose: () => void; // Function to handle closing the feedback message
}

// FeedbackMessage component
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  success,
  answer,
  onClose,
}) => {
  const [emoji, setEmoji] = useState(''); // State to store the emoji
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null); // State to track revealed answer
  const closeButtonRef = useRef<HTMLButtonElement>(null); // Reference for the close button

  // Happy and sad emoji arrays
  const happyEmojis = ['😊', '😃', '🥳', '😄', '🎉'];
  const sadEmojis = ['😢', '😞', '😔', '🙁', '😟'];

  // Function to get a random emoji from an array
  const getRandomEmoji = (emojiArray: string[]) => {
    return emojiArray[Math.floor(Math.random() * emojiArray.length)];
  };

  // Update the emoji based on the feedback type
  useEffect(() => {
    if (success) {
      setEmoji(getRandomEmoji(happyEmojis));
    } else {
      setEmoji(getRandomEmoji(sadEmojis));
    }
  }, [success]);

  // Function to reveal the correct answer
  const revealAnswer = () => {
    setRevealedAnswer(`A resposta correta é: ${answer}"`);
  };

  // Focus the close button when the component is rendered
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus(); // Automatically focus the close button
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="feedback-overlay">
      <div className="feedback-container">
        <p>
          {success ? 'Mandou bem!' : 'Tente novamente!'} {emoji}
        </p>

        {revealedAnswer && <p>{revealedAnswer}</p>}

        {!success && !revealedAnswer && (
          <button className="button" onClick={revealAnswer}>
            Revelar Resposta
          </button>
        )}

        <button className="button" onClick={onClose} ref={closeButtonRef}>
          {success ? 'Próxima Pergunta!' : 'Vou Tentar de Novo!'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackMessage;
