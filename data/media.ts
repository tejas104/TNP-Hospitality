export type MediaItem = {
  id: string;
  alt: string;
  src: string;
  tone: 'wedding' | 'venue' | 'people' | 'detail' | 'corporate';
  source: string;
};

const unsplash =
  'auto=format&fit=crop&w=1600&q=82';

export const media: MediaItem[] = [
  {
    id: 'palace-courtyard',
    alt: 'Luxury courtyard prepared for a destination celebration',
    src: `https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?${unsplash}`,
    tone: 'venue',
    source: 'Unsplash',
  },
  {
    id: 'tablescape',
    alt: 'Premium banquet tablescape with warm event lighting',
    src: `https://images.unsplash.com/photo-1528605248644-14dd04022da1?${unsplash}`,
    tone: 'detail',
    source: 'Unsplash',
  },
  {
    id: 'wedding-couple',
    alt: 'Elegant wedding moment in a warm venue',
    src: `https://images.unsplash.com/photo-1519741497674-611481863552?${unsplash}`,
    tone: 'wedding',
    source: 'Unsplash',
  },
  {
    id: 'floral',
    alt: 'Floral installation and celebration decor',
    src: `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?${unsplash}`,
    tone: 'detail',
    source: 'Unsplash',
  },
  {
    id: 'event-hall',
    alt: 'Cinematic event hall with guests and lights',
    src: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?${unsplash}`,
    tone: 'corporate',
    source: 'Unsplash',
  },
  {
    id: 'hostess',
    alt: 'Guest-facing hospitality professional welcoming attendees',
    src: `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?${unsplash}`,
    tone: 'people',
    source: 'Unsplash',
  },
  {
    id: 'coordinator',
    alt: 'Event coordinator reviewing details before guest arrival',
    src: `https://images.unsplash.com/photo-1551836022-d5d88e9218df?${unsplash}`,
    tone: 'people',
    source: 'Unsplash',
  },
  {
    id: 'ballroom',
    alt: 'Grand ballroom prepared for a premium reception',
    src: `https://images.unsplash.com/photo-1505236858219-8359eb29e329?${unsplash}`,
    tone: 'venue',
    source: 'Unsplash',
  },
  {
    id: 'resort',
    alt: 'Luxury resort destination by the water',
    src: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?${unsplash}`,
    tone: 'venue',
    source: 'Unsplash',
  },
  {
    id: 'banquet',
    alt: 'Fine dining banquet experience with candlelit tables',
    src: `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?${unsplash}`,
    tone: 'detail',
    source: 'Unsplash',
  },
  {
    id: 'terrace',
    alt: 'Destination terrace ready for a private celebration',
    src: `https://images.unsplash.com/photo-1519225421980-715cb0215aed?${unsplash}`,
    tone: 'wedding',
    source: 'Unsplash',
  },
  {
    id: 'team-briefing',
    alt: 'Hospitality team briefing before a live event',
    src: `https://images.unsplash.com/photo-1556761175-b413da4baf72?${unsplash}`,
    tone: 'people',
    source: 'Unsplash',
  },
  {
    id: 'architecture',
    alt: 'Premium destination architecture for event discovery',
    src: `https://images.unsplash.com/photo-1524230572899-a752b3835840?${unsplash}`,
    tone: 'venue',
    source: 'Unsplash',
  },
  {
    id: 'guest-experience',
    alt: 'Guests enjoying a refined celebration',
    src: `https://images.unsplash.com/photo-1511795409834-ef04bbd61622?${unsplash}`,
    tone: 'wedding',
    source: 'Unsplash',
  },
];

export const byId = (id: string) => media.find((item) => item.id === id) ?? media[0];
