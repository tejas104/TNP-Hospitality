import { roles, services } from './tnp';

export type PublicDetail = {
  slug: string;
  title: string;
  category: 'service' | 'department';
  summary: string;
  image: { src: string; alt: string };
  introduction: string;
  discussion: string[];
  related: string[];
  provenance: string;
};

// Content provenance: names, summaries and images come from the existing
// data/tnp.ts preview catalogue. Additional text below is editorial preview
// guidance, not client-approved inclusions, staffing promises or new policy.
export const serviceSlugs = [
  'event-coordinators',
  'event-executives',
  'volunteers',
  'guest-hospitality',
  'rsvp',
  'venue-discovery',
];
export const departmentSlugs = [
  'coordinator',
  'executive',
  'volunteer',
  'hostess',
];
const serviceIntroductions = [
  'A considered event needs a clear point of coordination. Explore how event leadership, communication and on-ground decisions could fit your programme.',
  'Between the plan and the moment are dozens of small handovers. Explore event-floor support that keeps guest movement, vendors and checkpoints in view.',
  'A helpful person in the right place can change a guest’s experience. Explore support for entry, directions and the practical tasks around your event.',
  'Hospitality begins with how a guest is welcomed. Explore guest-facing support for arrivals, communication and a calm, considered experience.',
  'Before the first arrival, there is a conversation. Explore human-led RSVP and the planned tools for connecting guest responses, travel and hospitality needs.',
  'The place sets the tone. Explore a starting point for discussing destinations, venue preferences and the experience you want to create.',
];
const serviceDiscussions = [
  [
    'Who will own decisions and escalations?',
    'Which functions need on-ground coordination?',
    'How should client and team updates be shared?',
  ],
  [
    'Where are the key guest and vendor handovers?',
    'Which checkpoints need floor support?',
    'What should the event-day briefing cover?',
  ],
  [
    'Where will guests need directions?',
    'Which entry and backstage tasks need support?',
    'Who will supervise and brief the support team?',
  ],
  [
    'How should guests be welcomed?',
    'Which language or accessibility needs should be discussed?',
    'Where are the important arrival and hospitality touchpoints?',
  ],
  [
    'Which functions need separate guest responses?',
    'What travel, pickup and stay needs should be coordinated?',
    'Is TNP-managed service or future vendor access the better fit?',
  ],
  [
    'Which destinations are you considering?',
    'What guest count and event format should guide the search?',
    'Which venue requirements matter most to you?',
  ],
];
export const publicServices: PublicDetail[] = services.map(
  (service, index) => ({
    slug: serviceSlugs[index],
    title: service.title,
    category: 'service',
    summary: service.copy,
    image: service.image,
    introduction: serviceIntroductions[index],
    discussion: serviceDiscussions[index],
    related:
      index < 4 ? [departmentSlugs[index]] : ['coordinator', 'executive'],
    provenance:
      'Existing TNP service catalogue and preview imagery; supporting discussion prompts are editorial preview copy. Final service names, inclusions, experience criteria and imagery require client approval.',
  }),
);
export const publicDepartments: PublicDetail[] = roles.map((role, index) => ({
  slug: departmentSlugs[index],
  title: role.role,
  category: 'department',
  summary: role.caption,
  image: role.image,
  introduction: services[index].copy,
  discussion: serviceDiscussions[index],
  related: [serviceSlugs[index]],
  provenance:
    'Existing TNP role catalogue and service descriptions. Four role subjects are currently evidenced; the proposed twelve-department catalogue, duties, eligibility and approved assets are still pending.',
}));
export const findPublicDetail = (
  category: PublicDetail['category'],
  slug: string,
) =>
  (category === 'service' ? publicServices : publicDepartments).find(
    (item) => item.slug === slug,
  );
export function enquiryInterest(value?: string) {
  if (value === 'vendor') return 'Vendor platform interest';
  if (value === 'managed-rsvp') return 'Managed RSVP enquiry';
  const item = [...publicServices, ...publicDepartments].find(
    (detail) => detail.slug === value,
  );
  return item ? `${item.title} enquiry` : 'Event enquiry';
}
