import type { Command } from './adapter';
import type { GuestFilters, PartyRow } from './logic';
import type { EventData, Organization, Persona, Section } from './model';

export type GoOptions = { party?: string | null; filters?: Partial<GuestFilters> };

export type SectionProps = {
  data: EventData;
  rows: PartyRow[];
  now: number;
  persona: Persona;
  org: Organization;
  can: (cmd: Command['type']) => boolean;
  canView: (view: Section) => boolean;
  refresh: () => void;
  go: (view: Section, opts?: GoOptions) => void;
  filters: GuestFilters;
  setFilters: (f: GuestFilters) => void;
  selectedParty: string | null;
  selectParty: (id: string | null) => void;
  changedIds: Set<string>;
};
