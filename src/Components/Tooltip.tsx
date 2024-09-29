import React, { ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  direction = 'top',
}) => {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip-box tooltip-${direction}`}>
        {content}
        <span className={`tooltip-arrow tooltip-arrow-${direction}`} />
      </div>
    </div>
  );
};

export default Tooltip;
