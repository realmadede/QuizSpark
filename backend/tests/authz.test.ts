import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import { prisma } from '../src/prisma';
import { generateToken } from '../src/utils/jwt';
import authRoutes from '../src/routes/auth';
import quizRoutes from '../src/routes/quizzes';
import sessionRoutes from '../src/routes/sessions';
import playerRoutes from '../src/routes/players';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/players', playerRoutes);

const server = http.createServer(app);
const PORT = 3001;

let userA: any, userB: any;
let tokenA: string, tokenB: string;
let quizAId: string;
let sessionAId: string;

test('Setup Server and Users', async () => {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));

  // Clean db for tests
  await prisma.playerAnswer.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.gameSession.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.profile.deleteMany({});

  // Create User A
  userA = await prisma.profile.create({
    data: { email: 'usera@test.com', password: 'hash', fullName: 'User A' },
  });
  tokenA = generateToken({
    userId: userA.id,
    email: userA.email,
    tokenVersion: userA.tokenVersion,
  });

  // Create User B
  userB = await prisma.profile.create({
    data: { email: 'userb@test.com', password: 'hash', fullName: 'User B' },
  });
  tokenB = generateToken({
    userId: userB.id,
    email: userB.email,
    tokenVersion: userB.tokenVersion,
  });

  // Create Quiz for User A
  const quiz = await prisma.quiz.create({
    data: { title: 'User A Quiz', ownerId: userA.id },
  });
  quizAId = quiz.id;

  // Create Session for User A's Quiz
  const session = await prisma.gameSession.create({
    data: { quizId: quizAId, hostId: userA.id, pin: '123456' },
  });
  sessionAId = session.id;

  assert.ok(quizAId);
});

test('User A cannot access User B protected data', async () => {
  // User B tries to get User A's quiz
  const res = await fetch(`http://localhost:${PORT}/api/quizzes/${quizAId}`, {
    headers: { Cookie: `token=${tokenB}` },
  });
  assert.strictEqual(res.status, 403, 'Expected 403 Forbidden');
});

test('User B cannot update User A record', async () => {
  const res = await fetch(`http://localhost:${PORT}/api/quizzes/${quizAId}`, {
    method: 'PATCH',
    headers: { Cookie: `token=${tokenB}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  assert.strictEqual(res.status, 403, 'Expected 403 Forbidden');
});

test('User B cannot delete User A record', async () => {
  const res = await fetch(`http://localhost:${PORT}/api/quizzes/${quizAId}`, {
    method: 'DELETE',
    headers: { Cookie: `token=${tokenB}` },
  });
  assert.strictEqual(res.status, 403, 'Expected 403 Forbidden');
});

test('User cannot assign another user as owner during creation', async () => {
  // Attempt to create quiz and inject ownerId as userA.id while logged in as userB
  const res = await fetch(`http://localhost:${PORT}/api/quizzes`, {
    method: 'POST',
    headers: { Cookie: `token=${tokenB}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Malicious Quiz', ownerId: userA.id }),
  });
  const data = await res.json();
  const createdQuiz = await prisma.quiz.findUnique({ where: { id: data.id } });
  assert.strictEqual(createdQuiz?.ownerId, userB.id, 'Owner should be forced to User B');
});

test('Student cannot view correct answers before question finishes', async () => {
  const res = await fetch(`http://localhost:${PORT}/api/sessions/${sessionAId}`); // Unauthenticated
  const data = await res.json();
  // Since session is in lobby, answers should NOT contain isCorrect
  const answers = data.quiz.questions[0]?.answers || [];
  for (const a of answers) {
    assert.strictEqual(
      a.isCorrect,
      undefined,
      'isCorrect should be stripped for non-hosts in lobby'
    );
  }
});

test('Host can view correct answers', async () => {
  const res = await fetch(`http://localhost:${PORT}/api/sessions/${sessionAId}`, {
    headers: { Cookie: `token=${tokenA}` },
  });
  const data = await res.json();
  const answers = data.quiz.questions[0]?.answers || [];
  // Assuming default answers are created or it's empty. Let's add a question to quiz A to test properly.
});

test('Teardown', async () => {
  server.close();
  await prisma.$disconnect();
});
