import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import helmet from 'helmet';
import { AppExceptionFilter } from './filters/all-exceptions.filter';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ShutdownService } from './lifecycle/on-app-shutdown';
import { dataSource } from '../data-source';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiKeyGuard } from './guards/api-key/api-key.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'verbose', 'debug'],
  });

  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.use(cors(), helmet());
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Certificates API')
    .setDescription('Examples for the certificates api')
    .setVersion('1.0')
    .addTag('certificates')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

  //app doesn't call lifecycle shutdown hooks, so this is a workaround
  function handle(signal: string) {
    new ShutdownService(dataSource, signal).closeDBConnection();
  }
  process.on('SIGINT', handle);
}
bootstrap();
