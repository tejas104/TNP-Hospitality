import { byId } from './media';

export const services = [
  {
    number: '01',
    title: 'Event Coordinators',
    copy: 'Senior professionals for live-event ownership, client communication and on-ground decision making. Typically 5+ years experience.',
    image: byId('coordinator'),
    tint: '#084C49',
  },
  {
    number: '02',
    title: 'Event Executives',
    copy: 'Reliable event floor support for vendors, guest movement, checkpoints and service rhythm. Approximately 3-3.5 years experience.',
    image: byId('event-hall'),
    tint: '#0F6B68',
  },
  {
    number: '03',
    title: 'Volunteers',
    copy: 'Trained support teams for entry, wayfinding, backstage movement and event-day errands. Approximately 1-2 years experience.',
    image: byId('team-briefing'),
    tint: '#172321',
  },
  {
    number: '04',
    title: 'Hostesses / Guest Hospitality',
    copy: 'Guest-facing professionals selected for presentation, warmth, communication and calm service under pressure.',
    image: byId('hostess'),
    tint: '#062B29',
  },
  {
    number: '05',
    title: 'RSVP Services',
    copy: 'Human-led guest communication, confirmation, follow-up, documentation and final list preparation for families and planners.',
    image: byId('banquet'),
    tint: '#BBA879',
  },
  {
    number: '06',
    title: 'Venue / Event Discovery',
    copy: 'Curated discovery support for clients searching for the right destination, venue or experience canvas.',
    image: byId('architecture'),
    tint: '#084C49',
  },
];

export const events = [
  ['ROYAL WEDDING', 'Jaipur', 'palace-courtyard'],
  ['DESTINATION CELEBRATION', 'Udaipur', 'terrace'],
  ['CORPORATE EXPERIENCE', 'Mumbai', 'event-hall'],
  ['PRIVATE CELEBRATION', 'Goa', 'resort'],
  ['GRAND RECEPTION', 'Pune', 'ballroom'],
].map(([title, place, image]) => ({ title, place, image: byId(image) }));

export const destinations = [
  ['Jaipur', 'palace-courtyard'],
  ['Udaipur', 'architecture'],
  ['Goa', 'resort'],
  ['Mumbai', 'event-hall'],
  ['Delhi', 'ballroom'],
  ['Pune', 'banquet'],
].map(([city, image], index) => ({ city, image: byId(image), index: `${index + 1}`.padStart(2, '0') }));

export const roles = [
  { role: 'Coordinator', image: byId('coordinator'), caption: 'Owns flow, escalation and client comfort.' },
  { role: 'Executive', image: byId('team-briefing'), caption: 'Keeps movement, vendors and checkpoints aligned.' },
  { role: 'Volunteer', image: byId('guest-experience'), caption: 'Supports guests and tasks with calm precision.' },
  { role: 'Hostess', image: byId('hostess'), caption: 'Leads first impressions and guest-facing grace.' },
];

export const navLinks = [
  { label: 'Experience', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Events', href: '/#events' },
  { label: 'For Clients', href: '/client' },
  { label: 'For Planners', href: '/planner' },
  { label: 'For Freelancers', href: '/freelancer' },
  { label: 'About', href: '/#about' },
];

export const portalLinks = [
  { label: 'Client', href: '/client' },
  { label: 'Planner', href: '/planner' },
  { label: 'Freelancer', href: '/freelancer' },
  { label: 'Operations Demo', href: '/admin' },
];
