import { useState } from 'react';

import './image-slider.css';

type Props = {
  images: string[];
};

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * The web SPA's listing slider, ported: arrows and dots, driven by clicks rather than by hover.
 * A detail page is where someone has already stopped to look, so the photos wait to be asked for
 * instead of cycling on their own the way the grid cards do.
 */
export function ImageSlider({ images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  function goTo(index: number) {
    setActiveIndex((index + images.length) % images.length);
  }

  return (
    <div className="image-slider">
      <img src={images[activeIndex]} alt="" className="image-slider-img" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="image-slider-arrow image-slider-arrow-prev"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous image"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="image-slider-arrow image-slider-arrow-next"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next image"
          >
            <ChevronRightIcon />
          </button>

          <div className="image-slider-dots">
            {images.map((path, index) => (
              <button
                key={`${index}-${path}`}
                type="button"
                className={index === activeIndex ? 'image-slider-dot active' : 'image-slider-dot'}
                onClick={() => goTo(index)}
                aria-label={`Image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
