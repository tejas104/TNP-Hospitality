export type ClientIllustration = {
  src: string;
  alt: string;
  source: string;
  caption: string;
  position: string;
  fallback: string;
};

// Presentation slots, never photographs identifying the synthetic catalogue.
export const clientIllustrations = {
  introduction: {
    src: '/images/destinations/udaipur.jpg',
    alt: 'Pale palace architecture beside the water in Udaipur',
    source: 'Existing local destination library',
    caption: 'Udaipur · illustrative destination, not a listed venue',
    position: '50% 50%',
    fallback: 'A sense of place. Destination photograph unavailable.',
  },
  Jaipur: {
    src: '/images/destinations/jaipur.jpg',
    alt: 'Pink sandstone facade with rows of intricate windows in Jaipur',
    source: 'Existing local destination library',
    caption: 'Jaipur context · not a photograph of this sample venue',
    position: '50% 65%',
    fallback: 'Jaipur destination context · photograph unavailable',
  },
  Udaipur: {
    src: '/images/destinations/udaipur.jpg',
    alt: 'Palace architecture beside the lake in Udaipur',
    source: 'Existing local destination library',
    caption: 'Udaipur context · not a photograph of this sample venue',
    position: '50% 55%',
    fallback: 'Udaipur destination context · photograph unavailable',
  },
} satisfies Record<string, ClientIllustration>;

export function venueIllustration(
  city: string,
): ClientIllustration | undefined {
  return city === 'Jaipur' || city === 'Udaipur'
    ? clientIllustrations[city]
    : undefined;
}
