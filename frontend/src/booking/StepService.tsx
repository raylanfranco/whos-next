import { useMemo } from 'react';
import type { Merchant, Service } from '../types';

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'tints': '/images/services/tints.jpg',
  'window tinting': '/images/services/tints.jpg',
  'radio installation': '/images/services/radio.jpg',
  'car audio': '/images/services/car-audio.jpg',
  'intoxalock': '/images/services/intoxalock.jpg',
  'remote start': '/images/services/remote-start.jpg',
  'lighting': '/images/services/lighting.jpg',
  'ppf': '/images/services/ppf.jpg',
  'paint protection': '/images/services/ppf.jpg',
  'accessories': '/images/services/accessories.jpg',
  'security': '/images/services/security.jpg',
};

function getServiceImage(service: Service): string | null {
  if (service.imageUrl) return service.imageUrl;
  const cat = (service.category || '').toLowerCase();
  return DEFAULT_CATEGORY_IMAGES[cat] || null;
}

function formatPrice(cents: number): { dollars: string; cents: string } {
  const total = cents / 100;
  const whole = Math.floor(total);
  const frac = Math.round((total - whole) * 100).toString().padStart(2, '0');
  return { dollars: whole.toLocaleString(), cents: frac };
}

interface StepServiceProps {
  merchant: Merchant | null;
  services: Service[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export function StepService({
  merchant,
  services,
  selectedCategory,
  onSelectCategory,
  selectedService,
  onSelectService,
}: StepServiceProps) {
  const { categories, skipCategories, visibleServices } = useMemo(() => {
    const grouped = new Map<string, Service[]>();
    for (const s of services) {
      const cat = s.category || 'Other';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(s);
    }
    const cats = Array.from(grouped.keys());
    const skip = cats.length <= 1;
    const visible = selectedCategory
      ? grouped.get(selectedCategory) || []
      : skip
        ? services
        : [];
    return { categories: cats, grouped, skipCategories: skip, visibleServices: visible };
  }, [services, selectedCategory]);

  const headingMain = !skipCategories && !selectedCategory
    ? 'What are you looking for?'
    : selectedCategory && !skipCategories
      ? selectedCategory
      : 'Select Service';
  const headingSub = !skipCategories && !selectedCategory
    ? 'Choose a category to browse available services.'
    : `Choose the service that fits your ${merchant?.vertical === 'POWERSPORTS' ? 'build' : merchant?.vertical === 'TATTOO' ? 'piece' : 'vehicle'}.`;

  return (
    <main
      className="bk-step-enter"
      style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      {selectedCategory && !skipCategories && (
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className="bk-mono"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--bk-text-muted)',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          All Categories
        </button>
      )}

      <header className="bk-heading" style={{ marginBottom: '3rem' }}>
        <h1
          className="bk-display"
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1,
            color: 'var(--bk-text-main)',
          }}
        >
          {headingMain}
        </h1>
        <p style={{ color: 'var(--bk-text-muted)', marginTop: '1rem', maxWidth: '40rem' }}>
          {headingSub}
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
          gap: '1.5rem',
        }}
      >
        {!selectedCategory && !skipCategories
          ? categories.map((cat) => {
              const catServices = services.filter((s) => (s.category || 'Other') === cat);
              const img = catServices.find((s) => getServiceImage(s))?.imageUrl
                || DEFAULT_CATEGORY_IMAGES[cat.toLowerCase()]
                || null;
              return (
                <CategoryCard
                  key={cat}
                  name={cat}
                  count={catServices.length}
                  imageUrl={img}
                  onClick={() => onSelectCategory(cat)}
                />
              );
            })
          : visibleServices.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                isSelected={selectedService?.id === s.id}
                onClick={() => onSelectService(s)}
              />
            ))}
      </div>
    </main>
  );
}

function ServiceCard({
  service,
  isSelected,
  onClick,
}: {
  service: Service;
  isSelected: boolean;
  onClick: () => void;
}) {
  const img = getServiceImage(service);
  const price = formatPrice(service.priceCents);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bk-card ${isSelected ? 'bk-card-selected' : ''}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <div className="bk-card-badge" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="square">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div
        className={img ? '' : 'bk-dot-grid'}
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          borderBottom: '1px solid var(--bk-border-subtle)',
          backgroundColor: 'var(--bk-bg-surface-elevated)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {img && (
          <img
            src={img}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('bk-dot-grid');
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.85) 100%)',
            zIndex: 1,
          }}
        />
        {!img && (
          <span
            className="bk-display"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
              color: 'var(--bk-border-subtle)',
              zIndex: 0,
              textTransform: 'uppercase',
            }}
            aria-hidden="true"
          >
            {service.name.charAt(0)}
          </span>
        )}
      </div>

      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h2
            className="bk-mono"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: 'var(--bk-text-main)',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {service.name}
          </h2>
          <DurationChip minutes={service.durationMins} />
        </div>

        {service.description && (
          <p style={{ color: 'var(--bk-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            {service.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '1.5rem' }}>
          <div
            className="bk-tile"
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.125rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bk-bg-base)',
            }}
          >
            <span className="bk-mono" style={{ fontSize: '1.125rem', color: 'var(--bk-text-muted)' }}>$</span>
            <span
              className="bk-mono"
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: 'var(--bk-text-main)',
                lineHeight: 1,
              }}
            >
              {price.dollars}
            </span>
            <span className="bk-mono" style={{ fontSize: '0.75rem', color: 'var(--bk-text-muted)', marginLeft: '0.125rem', letterSpacing: '0.1em' }}>
              .{price.cents}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function CategoryCard({
  name,
  count,
  imageUrl,
  onClick,
}: {
  name: string;
  count: number;
  imageUrl: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bk-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <div
        className={imageUrl ? '' : 'bk-dot-grid'}
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          borderBottom: '1px solid var(--bk-border-subtle)',
          backgroundColor: 'var(--bk-bg-surface-elevated)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.classList.add('bk-dot-grid');
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.85) 100%)',
          }}
        />
      </div>
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <h2
          className="bk-mono"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            color: 'var(--bk-text-main)',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {name}
        </h2>
        <span
          className="bk-mono bk-tile"
          style={{
            fontSize: '0.7rem',
            color: 'var(--bk-text-muted)',
            padding: '0.375rem 0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {count} {count === 1 ? 'Service' : 'Services'}
        </span>
      </div>
    </button>
  );
}

function DurationChip({ minutes }: { minutes: number }) {
  return (
    <div
      className="bk-mono bk-tile"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        fontSize: '0.7rem',
        letterSpacing: '0.15em',
        color: 'var(--bk-text-muted)',
        flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{minutes} MIN</span>
    </div>
  );
}
