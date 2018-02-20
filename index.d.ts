import { Kaze } from './src/kaze';
import { BaseContext, Request, Response } from 'koa';
import { RestMapper } from './src/decorator/mapper';


declare module "koa" {
  export interface BaseContext {
    service: any;
    request: Request;
    response: Response
  }
}


export class Burn extends Kaze {
  controller: any
  config: any;
}



export class Controller extends Kaze.Controller {
  app: Burn;
}



export class Service extends Kaze.Service {
  app: Burn;
}


export const mapper: RestMapper;


export as namespace Kaze;