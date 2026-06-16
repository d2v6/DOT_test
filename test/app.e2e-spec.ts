import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from './../src/users/user.entity';
import { Note } from './../src/notes/notes.entity';

describe('Auth and Notes API (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const username = `e2e_user_${Date.now()}`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (!dataSource) {
      return;
    }

    const user = await dataSource.getRepository(User).findOne({
      where: { username },
    });

    if (user) {
      await dataSource.getRepository(Note).delete({ user: { id: user.id } });
      await dataSource.getRepository(User).delete({ id: user.id });
    }

    await app?.close();
  });

  it('signs up, signs in, and uses JWT token to access notes', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ username, password })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.username).toBe(username);
        expect(body.password).toBeUndefined();
      });

    const signInResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username, password })
      .expect(201);

    const accessToken = signInResponse.body.access_token;
    expect(accessToken).toEqual(expect.any(String));

    await request(app.getHttpServer()).get('/notes').expect(401);

    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'E2E note' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.content).toBe('E2E note');
        expect(body.user).toBeUndefined();
      });

    await request(app.getHttpServer())
      .get('/notes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ content: 'E2E note' }),
          ]),
        );
        expect(body[0].user).toBeUndefined();
      });
  });
});
