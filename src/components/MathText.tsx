import React from 'react';
import { InlineMath } from 'react-katex';

interface MathTextProps {
  children: React.ReactNode;
}

export const MathText: React.FC<MathTextProps> = ({ children }) => {
  if (typeof children !== 'string') {
    return <>{children}</>;
  }

  const parts = children.split(/(\$.*?\$)/);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} />;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
