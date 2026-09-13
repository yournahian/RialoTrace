import React from 'react';

interface RialoLogoProps {
  size?: number;
  className?: string;
}

export const RialoLogo: React.FC<RialoLogoProps> = ({
  size = 28,
  className = '',
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', fontWeight: '800', fontFamily: 'var(--font-display)', fontSize: `${size}px`, letterSpacing: '-0.03em', color: '#ffffff' }} className={className}>
      <span>Rialo</span>
      <span style={{ color: 'var(--rialo-accent)', fontSize: `${size * 1.2}px`, lineHeight: 0, marginLeft: '1px' }}>.</span>
    </div>
  );
};
