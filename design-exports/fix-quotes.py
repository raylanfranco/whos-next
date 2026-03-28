import codecs
import glob
import os

base = os.path.dirname(os.path.abspath(__file__))
repo = os.path.join(base, '..', 'bayready-core-setup-mirror')

# Use the tmp repo path directly
files = [
    '/tmp/bayready-core-setup/frontend/src/pages/dashboard/BookingsPage.tsx',
    '/tmp/bayready-core-setup/frontend/src/pages/dashboard/ServicesPage.tsx',
    '/tmp/bayready-core-setup/frontend/src/pages/dashboard/CustomersPage.tsx',
    '/tmp/bayready-core-setup/frontend/src/pages/dashboard/SettingsPage.tsx',
    '/tmp/bayready-core-setup/frontend/src/components/PushPrompt.tsx',
]

total_fixes = 0
for f in files:
    try:
        with codecs.open(f, 'r', 'utf-8') as fh:
            content = fh.read()
    except FileNotFoundError:
        # Try Windows path
        f2 = f.replace('/tmp/', 'C:/tmp/')
        with codecs.open(f2, 'r', 'utf-8') as fh:
            content = fh.read()
        f = f2

    original = content

    # Fix 1: }}" followed by > (the most common break)
    # e.g., style={{ color: 'var(--color-accent)' }}">text
    # Should be: style={{ color: 'var(--color-accent)' }}>text
    content = content.replace('}}">', '}}>')

    # Fix 2: }}" at end of line or before whitespace
    # e.g., style={{ borderRadius: '999px' }}"
    content = content.replace('}}"', '}}')

    # Fix 3: Orphaned class attributes after style={{ }}
    # e.g., style={{ background: 'var(--color-surface-2)' }} flex items-center
    # This is harder - these need className to wrap the orphaned classes

    if content != original:
        fixes = original.count('}}"')
        total_fixes += fixes
        with codecs.open(f, 'w', 'utf-8') as fh:
            fh.write(content)
        print(f'Fixed {fixes} in {f}')
    else:
        print(f'Clean: {f}')

print(f'\nTotal fixes applied: {total_fixes}')
