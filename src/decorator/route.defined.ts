export enum RequestMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTIONS = 'options',
  HEAD = 'head'
}
export interface RouteInterface {
  path: string,
  method: RequestMethod,
  middlewares: Function[],
  propertyKey: string;
}
