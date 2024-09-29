// Tooltip.tsx
import React, { useState, ReactNode } from 'react';
import './Tooltip.css'; // Import CSS styles for the tooltip

// Define interface for tooltip props
interface TooltipProps {
  content: ReactNode; // The content to display inside the tooltip
  children: ReactNode; // The element that triggers the tooltip on hover or click
  direction?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip position
}

// Tooltip component
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  direction = 'top',
}) => {
  const [visible, setVisible] = useState(false);

  // Show tooltip
  const showTooltip = () => setVisible(true);

  // Hide tooltip
  const hideTooltip = () => setVisible(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <div className={`tooltip-box tooltip-${direction}`}>
        {content}
        <span className={`tooltip-arrow tooltip-arrow-${direction}`} />
      </div>
    </div>
  );
};

export default Tooltip;
