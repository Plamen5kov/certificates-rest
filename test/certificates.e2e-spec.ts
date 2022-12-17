import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { options } from '../data-source-test.config';
import { CertificatesModule } from '../src/certificates/certificates.module';
import { login } from './helpers';
import { randomUUID } from 'crypto';
import {
  Certificate,
  Status,
} from '../src/certificates/entities/certificate.entity';

describe('certificates endpoints (e2e)', () => {
  let app: INestApplication;
  let availableCertificate: Certificate;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, CertificatesModule, TypeOrmModule.forRoot(options)],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .get('/certificates/available')
      .expect(HttpStatus.OK)
      .then((response) => {
        availableCertificate = response.body[0];
      });
  });

  afterAll(async () => {
    await app.close();
  })
  
  it('/certificates/available (GET) gets all available certificates', async () => {
    await request(app.getHttpServer())
      .get('/certificates/available')
      .expect(HttpStatus.OK)
      .then((response) => {
        response.body.forEach((element) => {
          expect(element.status).toBe('available');
        });
      });
  });

  it('/certificates/mine (GET) to show error when user is not authorized', async () => {
    await request(app.getHttpServer())
      .get('/certificates/mine')
      .expect(HttpStatus.UNAUTHORIZED)
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
      });
  });

  it('/certificates/mine (GET) to list owned certificates when user is logged in', async () => {
    const accessToken = await login(app);

    await request(app.getHttpServer())
      .get('/certificates/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        response.body.forEach((element) => {
          expect(element.status).toBe('owned');
        });
      });
  });

  it('/certificates/aquireAvailable (POST) to show error when user is not authorized', async () => {
    await request(app.getHttpServer())
      .post(`/certificates/aquireAvailable/${randomUUID}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/certificates/aquireAvailable (POST) will aquire available certificate', async () => {
    const accessToken = await login(app);

    await request(app.getHttpServer())
      .post(`/certificates/aquireAvailable/${availableCertificate.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.username).toEqual('plamen1');
        response.body.certificates.forEach((element) => {
          expect(element.id).toEqual(
            expect.stringMatching(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
            ),
          );
          expect(element.status).not.toContain(Status.AVAILABLE);
        });
      });
  });

  it('/certificates/aquireAvailable (POST) will fail to aquire unavailable cert', async () => {
    const accessToken = await login(app);

    await request(app.getHttpServer())
      .post(`/certificates/aquireAvailable/${availableCertificate.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.BAD_REQUEST)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.stringMatching(
            /^Could not find available certificate with id/,
          ),
        );
      });
  });

  it('/certificates/transferOwn (POST) will successfully transfer certificate and be unable to transfer it again', async () => {
    const accessToken = await login(app);

    let ownCertificate;
    await request(app.getHttpServer())
      .get('/certificates/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        ownCertificate = response.body[0];
      });

    let randomOtherUser;
    await request(app.getHttpServer())
      .get('/users')
      .then((response) => {
        randomOtherUser = response.body.filter(
          (u) => u.username !== 'plamen1',
        )[0];
      });

    await request(app.getHttpServer())
      .post(`/certificates/transferOwn`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        certificateId: ownCertificate.id,
        toUserId: randomOtherUser.id,
      })
      .expect(HttpStatus.OK)
      .then((response) => {
        const transferredCertificate = response.body.certificates.filter(
          (c) => c.id === ownCertificate.id,
        )[0];
        expect(transferredCertificate.status).toBe(Status.TRANSFERRED);
        expect(response.body.username).toBe(randomOtherUser.username);
      });

    await request(app.getHttpServer())
      .post(`/certificates/transferOwn`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        certificateId: ownCertificate.id,
        toUserId: randomOtherUser.id,
      })
      .expect(HttpStatus.BAD_REQUEST)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.stringMatching(
            /^No certificates found for transfer. Make sure you own this certificate:/,
          ),
        );
      });
  });

  it('/certificates/transferOwn (POST) will not be able to transfer own certificate to non existant user', async () => {
    const accessToken = await login(app);

    let ownCertificate;
    await request(app.getHttpServer())
      .get('/certificates/mine')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        ownCertificate = response.body[0];
      });

    await request(app.getHttpServer())
      .post(`/certificates/transferOwn`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        certificateId: ownCertificate.id,
        toUserId: randomUUID(),
      })
      .expect(HttpStatus.BAD_REQUEST)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.stringMatching(/^Didn't find any user with id/),
        );
      });
  });
});
