import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

export async function login(app: any, loginUser = 'plamen1'): Promise<string> {
  return new Promise((resolve, reject) => {
    request(app.getHttpServer())
      .post('/auth/login')
      .set('Accept', 'application/json')
      .send({ username: loginUser, password: 'password' })
      .expect(HttpStatus.OK)
      .then((response: any) => {
        resolve(response.text);
      })
      .catch((e) => {
        reject(e);
      });
  });
}

export async function postWithExpectedStatus(
  app: any,
  url: string,
  statusCode: HttpStatus,
  accessToken = '',
  registerName: string = null,
) {
  return await request(app.getHttpServer())
    .post(url)
    .send(
      registerName ? { username: registerName, password: 'password' } : null,
    )
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(statusCode);
}

export async function getWithExpectedStatus(
  app: any,
  url: string,
  statusCode: HttpStatus,
  accessToken = '',
) {
  return await request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(statusCode);
}
