import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const useImportHistoryMock = vi.fn();
const uploadAsync = vi.fn();

vi.mock('../../hooks/useImport', () => ({
  useImportHistory: () => useImportHistoryMock(),
  useUploadCsv: () => ({ mutateAsync: uploadAsync, isPending: false }),
  useSaveMapping: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSkipRow: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useConfirmImport: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { Import } from '../../pages/Import';

class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  readAsText() {
    const event = {
      target: { result: 'Date,Amount,Description\nbad,0,' },
    } as unknown as ProgressEvent<FileReader>;
    if (this.onload) this.onload(event);
  }
}

describe('Import page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('FileReader', MockFileReader);
  });

  test('shows history loading and empty state safely', () => {
    useImportHistoryMock.mockReturnValueOnce({ data: undefined, isLoading: true });
    const { rerender } = render(
      <MemoryRouter>
        <Import />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    useImportHistoryMock.mockReturnValueOnce({ data: [], isLoading: false });
    rerender(
      <MemoryRouter>
        <Import />
      </MemoryRouter>
    );
    expect(screen.getByText('No import history yet')).toBeInTheDocument();
  });

  test('shows helpful error when csv import fails', async () => {
    useImportHistoryMock.mockReturnValue({ data: [], isLoading: false });
    uploadAsync.mockRejectedValueOnce(new Error('Import failed on upload'));

    render(
      <MemoryRouter>
        <Import />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start Import' }));
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['x'], 'bad.csv', { type: 'text/csv' })] } });

    expect(await screen.findByText('Import failed on upload')).toBeInTheDocument();
  });
});
