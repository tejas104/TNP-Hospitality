import { chooserHref, workspaces } from '../access/routes.ts';
export { publicNavigation } from '../access/routes.ts';

export const productAudiences = workspaces.map((workspace) => ({
  id: workspace.id,
  name: workspace.label,
  href: chooserHref(workspace.id),
  summary: workspace.purpose,
  detail: workspace.purpose,
  action: `Choose ${workspace.label} demo profile`,
  kind: workspace.available
    ? 'Synthetic preview'
    : 'Synthetic access preview · adapter pending',
}));

// Existing homepage drawer catalogue is frozen with the homepage program exclusion.
export const accessAudiences = [
  {
    id: 'client',
    name: 'Client',
    href: '/client',
    summary: 'Shape your celebration and explore event support.',
    detail:
      'Explore sample venues, event ideas and a planning brief for your occasion.',
    action: 'Open Client preview',
    kind: 'Synthetic preview',
  },
  {
    id: 'planner',
    name: 'Planner',
    href: '/planner',
    summary: 'Plan events and organise professional teams.',
    detail:
      'Try a sample event workspace for requirements, people and planning.',
    action: 'Open Planner preview',
    kind: 'Synthetic preview',
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
    href: '/freelancer',
    summary: 'Explore event opportunities and your work journey.',
    detail:
      'Browse sample opportunities and see the freelancer work experience.',
    action: 'Open Freelancer preview',
    kind: 'Synthetic preview',
  },
  {
    id: 'partner',
    name: 'RSVP Partner',
    href: '/contact?interest=vendor',
    summary: 'Discuss guest hospitality for your event business.',
    detail:
      'Register interest in a planned partner workspace. Access is provisioned by TNP, not self-activated here.',
    action: 'Enquire about partner access',
    kind: 'Synthetic enquiry',
  },
] as const;
