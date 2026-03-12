import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const uploadAsync = vi.fn();
const saveMappingAsync = vi.fn();
const skipRowAsync = vi.fn();
const confirmAsync = vi.fn();

vi.mock('../../hooks/useImport', () => ({
  useUploadCsv: () => ({ mutateAsync: uploadAsync, isPending: false }),
  useSaveMapping: () => ({ mutateAsync: saveMappingAsync, isPending: false }),
  useSkipRow: () => ({ mutateAsync: skipRowAsync, isPending: false }),
  useConfirmImport: () => ({ mutateAsync: confirmAsync, isPending: false }),
}));

import { ImportWizard } from '../../components/ImportWizard';

class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  readAsText() {
    const event = {
      target: { result: 'Date,Amount,Description\n2026-03-01,10,Coffee' },
    } as unknown as ProgressEvent<FileReader>;
    if (this.onload) this.onload(event);
  }
}

describe('ImportWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('FileReader', MockFileReader);
  });

  test('shows helpful error when upload fails', async () => {
    uploadAsync.mockRejectedValueOnce(new Error('CSV import failed'));
    render(<ImportWizard onComplete={vi.fn()} onCancel={vi.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['a,b'], 'x.csv', { type: 'text/csv' })] } });

    expect(await screen.findByText('CSV import failed')).toBeInTheDocument();
  });

  test('does not silently proceed on malformed mapping requirements', async () => {
    uploadAsync.mockResolvedValueOnce({
      session: { id: 1 },
      structure: {
        headers: ['A', 'B'],
        delimiter: ',',
        rowCount: 1,
        sampleRows: [['1', '2']],
        suggestedMapping: {},
      },
    });

    render(<ImportWizard onComplete={vi.fn()} onCancel={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['a,b'], 'x.csv', { type: 'text/csv' })] } });

    await waitFor(() => expect(screen.getByText('Map CSV Columns')).toBeInTheDocument());
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
    fireEvent.click(continueButton);
    expect(saveMappingAsync).not.toHaveBeenCalled();
  });
});
