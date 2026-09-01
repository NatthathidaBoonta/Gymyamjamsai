/**
 * ExerciseImage.tsx — Smart exercise image/GIF display component
 * Handles GIF, MP4, and standard image formats
 */

import { useState } from 'react';
import { getImageUrl, getMediaType } from '../utils/imageUtils';
import './ExerciseImage.css';

interface ExerciseImageProps {
  mediaUrl: string | null | undefined;
  altText?: string;
  className?: string;
  maxHeight?: number | string;
}

function ExerciseImage({ mediaUrl, altText = 'Exercise', className = '', maxHeight = 300 }: ExerciseImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUrl = getImageUrl(mediaUrl);
  const mediaType = getMediaType(mediaUrl);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`exercise-image-container ${className}`} style={{ maxHeight }}>
      {loading && (
        <div className="exercise-image-loader">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      )}

      {!error ? (
        <>
          {mediaType === 'gif' || mediaType === 'mp4' ? (
            <img
              src={imageUrl}
              alt={altText}
              onLoad={handleLoad}
              onError={handleError}
              className={`exercise-image ${loading ? 'hidden' : ''}`}
            />
          ) : (
            <img
              src={imageUrl}
              alt={altText}
              onLoad={handleLoad}
              onError={handleError}
              className={`exercise-image ${loading ? 'hidden' : ''}`}
            />
          )}
        </>
      ) : (
        <div className="exercise-image-error">
          <p>📸</p>
          <p>{altText}</p>
          <span className="text-muted">Image not available</span>
        </div>
      )}
    </div>
  );
}

export default ExerciseImage;
