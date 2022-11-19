import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CertificatesModule } from './certificates/certificates.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UsersController } from './users/users.controller';
import { CertificatesController } from './certificates/certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { options } from '../data-source';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    CertificatesModule,
    AuthModule,
    TypeOrmModule.forRoot(
      Object.assign(options, {
        retryAttempts: 3,
        retryDelay: 5000,
        synchronize: true,
        autoLoadEntities: true,
      }),
    ),
  ],
  providers: [],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(UsersController, CertificatesController);
  }
}
