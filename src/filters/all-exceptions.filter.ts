import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(HttpException, QueryFailedError)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'unknown error';

    switch (true) {
      case exception instanceof HttpException:
        status = exception.getStatus();
        const responseMessage = exception.response?.message;
        message = `${
          Array.isArray(responseMessage)
            ? responseMessage?.join(', ')
            : responseMessage
        }`;
        break;
      case exception instanceof QueryFailedError:
        status = HttpStatus.BAD_REQUEST;
        message = `${exception.message} ${exception.detail}`;
        break;
      default:
        if (exception instanceof Error) {
          status = (exception as any)?.status
            ? (exception as any).status
            : HttpStatus.BAD_REQUEST;
          message = `${exception.message}`;
          break;
        }
    }

    response.status(status).json({
      status: status,
      message: message,
    });
  }
}
