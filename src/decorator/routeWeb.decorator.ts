import { Router } from 'express';
import { RouteInterface, RequestMethod } from './route.defined';
// import { checkTokenWeb } from '$middleware/web.middleware';

export const webRouter = Router();
// Decorator for web route, defalut root path = /v1/app
export const WebController = (routePrefix: string, version: string = '/api/v1/web'): ClassDecorator => {
  return (targetClass: any) => {
    if (!Reflect.hasOwnMetadata('routes', targetClass)) {
      Reflect.defineMetadata('routes', [], targetClass);
    }
    const rootPath = version + routePrefix;
    const instance = new targetClass();
    const routes = Reflect.getMetadata('routes', targetClass) as RouteInterface[];
    routes.forEach((route: RouteInterface) => {
      (webRouter as any)[route.method](rootPath + route.path, route.middlewares, instance[route.propertyKey]);
    });
  };
};

export const Method = (
	path: string,
	middlewares: Function[] = [],
	method: RequestMethod
): MethodDecorator => {
	middlewares = middlewares.length ? middlewares : [];
	return (target: ClassDecorator, propertyKey: string, descriptor: PropertyDescriptor) => {
		if (!Reflect.hasOwnMetadata('routes', target.constructor)) {
			Reflect.defineMetadata('routes', [], target.constructor);
		}
		const routes: RouteInterface[] = Reflect.getMetadata('routes', target.constructor);
		routes.push({
			path,
			method,
			middlewares,
			propertyKey,
		});
		Reflect.defineMetadata('routes', routes, target.constructor);
	};
};

export const Get = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.GET);
};

export const Post = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.POST);
};

export const Put = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.PUT);
};

export const Delete = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.DELETE);
};

export const Options = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.OPTIONS);
};

export const Head = (path: string, middlewares?: Function[]): MethodDecorator => {
  return Method(path, middlewares, RequestMethod.HEAD);
};
