import { Request, Response, NextFunction } from "express";

export type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'options';
export type MiddlewareFunction = (res: Request, req: Response, next?: NextFunction) => Promise<void>;

export interface IRouteDefinition {
  requestMethod: RequestMethod; // Http request
  path: string; // Path for source code
  middlewares: Array<MiddlewareFunction>;
  methodName: string | symbol;
}
