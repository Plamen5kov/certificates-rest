import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './logic/users/users.module';
import { CertificatesModule } from './logic/certificates/certificates.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UsersController } from './logic/users/users.controller';
import { CertificatesController } from './logic/certificates/certificates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './logic/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { options } from '../data-source';
import { CommonModule } from './common/common.module';
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
    CommonModule,
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
