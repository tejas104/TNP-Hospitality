// Dev-only component matrix. Not an app route, a demo catalogue or production data.
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { PartnerCard } from '../components/tnp/shared/PartnerCard';
import {
  Feedback,
  AttentionQueue,
} from '../components/tnp/access/ProductPrimitives';
import type { PartnerEvidence } from '../components/tnp/access/partner-evidence';
import '../app/globals.css';

const base: PartnerEvidence = {
  id: 'test-venue',
  kind: 'venue',
  name: 'Synthetic venue with a deliberately long descriptive name for responsive testing',
  summary: 'Test fixture only. Not a real partner.',
  location: { text: 'Sample city', source: 'Synthetic fixture' },
};
function Matrix() {
  const [selected, setSelected] = useState(false);
  const [retry, setRetry] = useState(0);
  return (
    <main className="ux-product" style={{ padding: 20 }}>
      <h1>Component verification fixtures</h1>
      <output aria-live="polite">Retry count: {retry}</output>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 24,
          marginTop: 24,
        }}
      >
        <PartnerCard
          partner={base}
          state={selected ? 'selected' : 'ready'}
          actionLabel="Choose test venue"
          onSelect={() => setSelected(!selected)}
        />
        <PartnerCard
          partner={{
            ...base,
            id: 'broken',
            name: 'Broken image fixture',
            media: {
              src: '/tests/missing-image.png',
              alt: 'Synthetic missing image',
              source: 'Test fixture',
              rights: 'Test-owned',
              relationship: 'illustrative',
            },
          }}
          actionLabel="Choose broken-image fixture"
          onSelect={() => {}}
        />
        <PartnerCard
          partner={{
            ...base,
            id: 'evidence',
            name: 'Complete synthetic evidence',
            price: {
              minMinor: 10000000,
              maxMinor: 20000000,
              qualifier: 'Sample budget band',
              unit: 'event',
              scope: 'Venue only',
              source: 'Synthetic fixture',
            },
            rating: {
              value: 4.5,
              scale: 5,
              reviewCount: 12,
              source: 'Synthetic review fixture',
              verifier: 'Synthetic verifier',
            },
            media: {
              src: '/tests/ux-illustration.svg',
              alt: 'Geometric test illustration',
              source: 'Locally authored test illustration',
              rights: 'Test-owned',
              relationship: 'illustrative',
            },
          }}
          actionLabel="Choose evidence fixture"
          onSelect={() => {}}
        />
        <PartnerCard
          partner={{
            ...base,
            kind: 'tnp-planner',
            name: 'Sample planner without rating, portrait or price',
          }}
          state="unavailable"
          reason="Sample availability has not been supplied."
          actionLabel="Choose planner"
          onSelect={() => {}}
        />
        <PartnerCard
          partner={{ ...base, name: 'Loading fixture' }}
          state="loading"
          actionLabel="Choose loading fixture"
          onSelect={() => {}}
        />
        <PartnerCard
          partner={{ ...base, name: 'Retry fixture' }}
          state="error"
          actionLabel="Choose retry fixture"
          onSelect={() => {}}
          onRetry={() => setRetry(retry + 1)}
        />
        <Feedback state="empty" title="No matching options">
          Change the filters to explore other choices.
        </Feedback>
        <Feedback state="disabled" title="Selection unavailable">
          A reviewed availability contract is required.
        </Feedback>
        <Feedback
          state="error"
          title="Unable to load options"
          onRetry={() => setRetry(retry + 1)}
        >
          Your selection has been kept. Try again.
        </Feedback>
        <AttentionQueue title="Empty attention queue" items={[]} />
      </div>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Matrix />);
