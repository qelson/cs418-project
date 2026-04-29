process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV   = 'test';

const request = require('supertest');
const express = require('express');

// Mock the User model before requiring auth routes
jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  create:  jest.fn(),
}));

// Mock bcrypt so tests run fast
jest.mock('bcrypt', () => ({
  hash:    jest.fn().mockResolvedValue('$2b$12$hashed'),
  compare: jest.fn(),
}));

const User       = require('../models/User');
const bcrypt     = require('bcrypt');
const authRouter = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

beforeEach(() => jest.clearAllMocks());

// ── 1. Successful registration returns 201 ────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('returns 201 on successful registration', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id:       '507f1f77bcf86cd799439011',
      firstName: 'Jane',
      lastName:  'Doe',
      email:     'jane@example.com',
      verified:  false,
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName:  'Doe',
        email:     'jane@example.com',
        password:  'Password1!',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/registration successful/i);
  });

  // ── 2. Duplicate email returns 409 ──────────────────────────────────────────
  test('returns 409 for duplicate email', async () => {
    User.findOne.mockResolvedValue({ email: 'jane@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName:  'Doe',
        email:     'jane@example.com',
        password:  'Password1!',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('returns 400 when password fails validation', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName:  'Doe',
        email:     'jane@example.com',
        password:  'weak',
      });

    expect(res.statusCode).toBe(400);
  });
});

// ── 3. Invalid credentials return 401 ────────────────────────────────────────
describe('POST /api/auth/login', () => {
  test('returns 401 for non-existent user', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password1!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('returns 401 for wrong password', async () => {
    User.findOne.mockResolvedValue({
      email:    'jane@example.com',
      password: '$2b$12$hashed',
      verified: true,
      otpCode:  null,
      otpExpiry: null,
      save:     jest.fn(),
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: 'WrongPass1!' });

    expect(res.statusCode).toBe(401);
  });
});
