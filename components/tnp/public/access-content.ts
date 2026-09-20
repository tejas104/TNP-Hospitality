import { chooserHref, workspaces } from '../access/routes.ts';
export { publicNavigation } from '../access/routes.ts';

export const accessAudiences = workspaces.map((workspace) => ({
  id: workspace.id, name: workspace.label, href: chooserHref(workspace.id),
  summary: workspace.purpose, detail: workspace.purpose,
  action: `Choose ${workspace.label} demo profile`,
  kind: workspace.available ? 'Synthetic preview' : 'Synthetic access preview · adapter pending',
}));
