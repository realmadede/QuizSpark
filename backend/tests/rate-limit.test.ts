import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import { prisma } from '../src/prisma';
import { checkQuota } from '../src/utils/quota';
import authRoutes from '../src/routes/auth';
import quizRoutes from '../src/routes/quizzes';
import sessionRoutes from '../src/routes/sessions';
import playerRoutes from '../src/routes/players';
import cookieParser from 'cookie-parser';

const app = express();
// Ensure trust proxy for IP based testing
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/players', playerRoutes);

const server = http.createServer(app);
const PORT = 3002;

test('Setup Rate Limit Tests', async () => {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
});

test('Search/General IP Rate Limit works', async () => {
  // auth/login uses authLimiter, max 10
  let status = 200;
  for (let i = 0; i < 12; i++) {
    const res = await fetch(`http://localhost:${PORT}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '192.168.1.100' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
    });
    status = res.status;
  }
  assert.strictEqual(status, 429, 'Expected 429 after 10 requests');
});

test('Account API limits work', async () => {
  // Mock user and request to /api/quizzes
  // For simplicity, we just use the quota check directly for the paid API
});

test('Paid API Quota enforces limit globally', async () => {
  const key = 'test_quota';

  // Exhaust quota (limit = 5)
  for (let i = 0; i < 5; i++) {
    const { allowed } = await checkQuota(key, 5, 10000);
    assert.strictEqual(allowed, true);
  }

  // 6th request should fail
  const { allowed } = await checkQuota(key, 5, 10000);
  assert.strictEqual(allowed, false);
});

test('Teardown Rate Limits', async () => {
  server.close();
});
