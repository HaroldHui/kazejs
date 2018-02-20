import * as Koa from 'koa';
import { Loader } from './loader';
import { Controller } from './base/controller';
import { mapper, RestMapper } from './decorator/mapper';
import { Service } from './base/service';


export class Kaze extends Koa {
  static Controller: typeof Controller = Controller;
  static Service: typeof Service = Service;
  static mapper: RestMapper = mapper;
  private loader: Loader;
  private port: number;
  private ip: string;
  config: any = {};

  constructor() {
    super();
    this.loader = new Loader(this);
    this.port = 3000;
    this.ip = '127.0.0.1';
  }

  loadDefaultMiddleware() {
    const bodyParser = require('koa-bodyparser');
    this.use(bodyParser());
  }

  run(port?: number, ip?: string) {
    port = port || this.port;
    ip = ip || this.ip;
    this.loadDefaultMiddleware();
    this.loader.load();
    return this.listen(port, ip, () => {
      console.log(`Server is run on ${ip}:${port}`);
    });
  }
}