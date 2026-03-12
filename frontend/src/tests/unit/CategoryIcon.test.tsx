import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { CategoryIcon } from '../../components/CategoryIcon';

describe('CategoryIcon', () => {
  test('renders fallback icon for unknown key', () => {
    const { container } = render(<CategoryIcon icon="unknown-icon" />);
    // Lucide renders svg; fallback still produces one icon element.
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
