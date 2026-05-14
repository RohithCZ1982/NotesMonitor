import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: any, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
