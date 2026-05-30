import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser — pulls the authenticated user off the request.
 * The JWT strategy populates request.user after token validation.
 *
 * Use this in controller methods instead of reaching into the raw request.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
