import React, { useState } from 'react';
import './RotatingLogo.css';

interface RotatingLogoProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    speed?: number; // seconds per rotation
}

export const RotatingLogo: React.FC<RotatingLogoProps> = ({
    src,
    alt,
    className = '',
    style = {},
    speed = 3 // EDIT HERE: Seconds per full rotation (higher = slower)
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
        setIsAnimating(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const handleAnimationIteration = () => {
        if (!isHovering) {
            setIsAnimating(false);
        }
    };

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${isAnimating ? 'rotating' : ''}`}
            style={{
                ...style,
                '--rotation-duration': `${speed}s`
            } as React.CSSProperties}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onAnimationIteration={handleAnimationIteration}
        />
    );
};
