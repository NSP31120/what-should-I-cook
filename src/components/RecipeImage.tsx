import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { RECIPE_IMAGE_URLS } from '../data/recipeImages';

interface RecipeImageProps {
  recipeId: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export function RecipeImage({
  recipeId,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: RecipeImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const imageUrl = RECIPE_IMAGE_URLS[recipeId];

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {(!isLoaded || hasFailed || !imageUrl) && (
        <div
          className={`absolute inset-0 flex items-center justify-center text-stone-400 ${
            !hasFailed && imageUrl ? 'animate-pulse bg-stone-100' : ''
          }`}
          role={hasFailed || !imageUrl ? 'img' : undefined}
          aria-label={hasFailed || !imageUrl ? alt : undefined}
          aria-hidden={!hasFailed && Boolean(imageUrl)}
        >
          <ImageOff className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      {imageUrl && !hasFailed && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          sizes={sizes}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasFailed(true)}
        />
      )}
    </div>
  );
}
