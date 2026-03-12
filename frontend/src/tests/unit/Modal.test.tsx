import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Modal } from '../../components/Modal';

describe('Modal', () => {
  test('closes on escape key and backdrop click', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <div>Body</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(document.querySelector('.bg-black') as Element);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('restores body overflow on unmount', () => {
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()} title="Overflow Test">
        <div>Body</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  test('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Closed">
        <div>Body</div>
      </Modal>
    );
    expect(screen.queryByText('Closed')).not.toBeInTheDocument();
  });
});
