import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const pathInfo = req.originalUrl;
    this.logger.log(
      `${req.method} ${pathInfo} body: ${
        req?.body ? JSON.stringify(req.body) : ''
      } params: ${JSON.stringify(req.params)}`,
    );
    next();
  }
}
