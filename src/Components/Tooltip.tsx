import React, { ReactNode } from 'react';
import './Tooltip.css';
import { Definition } from '../Model/Definitions';

interface TooltipProps {
  word: string;
  definition?: Definition;
  children: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ word, definition, children }) => {
  return (
    <div className="tooltip-wrapper">
      <a className="tooltip-trigger" href="#definition">
        {children}
      </a>
      <div className="tooltip-box">
        <strong>{word}:</strong> {definition?.description}
      </div>
    </div>
  );
};

export default Tooltip;
