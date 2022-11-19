import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import helmet from 'helmet';
import { AppExceptionFilter } from './filters/all-exceptions.filter';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { ShutdownService } from './lifecycle/on-app-shutdown';
import { dataSource } from '../data-source';

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

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(3000);

  //app doesn't call lifecycle shutdown hooks, so this is a workaround
  function handle(signal: string) {
    new ShutdownService(dataSource, signal).closeDBConnection();
  }
  process.on('SIGINT', handle);
}
bootstrap();
