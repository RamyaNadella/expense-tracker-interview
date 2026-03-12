export const expenseScenarios = {
  create: {
    amount: '45.70',
    description: 'E2E lunch',
    date: '2026-03-10',
  },
  update: {
    amount: '89.25',
    description: 'E2E updated lunch',
    date: '2026-03-11',
  },
} as const;

export const importScenarios = {
  happyPath: {
    fileName: 'e2e-happy.csv',
    csv: [
      'Date,Amount,Description,Category',
      '2026-03-01,10.50,Imported Coffee,Food',
      '2026-03-02,22.00,Imported Taxi,Transport',
    ].join('\n'),
    expectedDescriptions: ['Imported Coffee', 'Imported Taxi'],
  },
  mixedRows: {
    fileName: 'e2e-mixed.csv',
    csv: [
      'Date,Amount,Description,Category',
      '2026-03-05,12.34,Valid Row,Food',
      'invalid-date,0,,Unknown',
    ].join('\n'),
  },
} as const;
