import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { options } from '../data-source-test.config';
import { CertificatesModule } from '../src/certificates/certificates.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const registerName = randomUUID();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, CertificatesModule, TypeOrmModule.forRoot(options)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST) initial register allows only one registration with a name', async () => {
    //no problem registering user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: registerName, password: 'password' })
      .expect(HttpStatus.CREATED)
      .then((response) => {
        expect(response.body.message).toBe('Successfully registered');
      });

    // secondary registration with the same name throws an error
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: registerName, password: 'password' })
      .expect(HttpStatus.BAD_REQUEST)
      .then((response) => {
        expect(response.body.message).toBe('Username is taken');
      });
  });

  it('/auth/login (POST) user with registration can login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ username: registerName, password: 'password' })
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.accessToken).toEqual(expect.any(String));
      });
  });

  it(`/auth/login (POST) user WITHOUT registration CAN'T login`, async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'not', password: 'password' })
      .expect(HttpStatus.UNAUTHORIZED)
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
      });
  });
});
