import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import User from '../models/User.model';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/samudra-alert-test');
  });

  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toEqual(401);
  });
});
