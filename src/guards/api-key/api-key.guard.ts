import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //how to read metadata from (SetMetadata) on methods
    const isPublc = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());

    //how to read metadata from (SetMetadata) on classes
    const isPublcClass = this.reflector.get(IS_PUBLIC_KEY, context.getClass());

    return true;
  }
}
