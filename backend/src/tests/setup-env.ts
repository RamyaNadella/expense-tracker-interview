const TEST_JWT_SECRET = 'expense-tracker-test-jwt-secret';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = TEST_JWT_SECRET;
}
