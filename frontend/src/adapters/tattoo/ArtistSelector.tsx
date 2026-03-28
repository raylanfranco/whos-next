interface Artist {
  id: string;
  name: string;
  specialties: string[];
  photoUrl?: string;
}

interface ArtistSelectorProps {
  artists: Artist[];
  value: string;
  onChange: (artistId: string) => void;
}

export default function ArtistSelector({ artists, value, onChange }: ArtistSelectorProps) {
  if (artists.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
        Choose Your Artist <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {artists.map((artist) => {
          const isSelected = value === artist.id;
          return (
            <button
              key={artist.id}
              type="button"
              onClick={() => onChange(isSelected ? '' : artist.id)}
              className="p-3 text-left transition-all"
              style={{
                background: isSelected ? 'var(--color-accent-muted)' : 'var(--color-accent-subtle)',
                border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              {artist.photoUrl ? (
                <img
                  src={artist.photoUrl}
                  alt={artist.name}
                  className="w-12 h-12 object-cover mb-2"
                  style={{ border: '1px solid var(--color-border-accent)' }}
                />
              ) : (
                <div
                  className="w-12 h-12 mb-2 flex items-center justify-center text-lg font-bold font-display"
                  style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)', color: 'var(--color-accent)' }}
                >
                  {artist.name.charAt(0)}
                </div>
              )}
              <div className="text-sm font-medium text-white">{artist.name}</div>
              {artist.specialties.length > 0 && (
                <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {artist.specialties.join(' · ')}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
