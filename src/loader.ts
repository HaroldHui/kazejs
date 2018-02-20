import * as fs from 'fs';
import * as path from 'path';
import { Kaze } from './kaze';
import { BaseContext } from 'koa';
import * as Router from 'koa-router';
import { mapper } from './decorator/mapper';

const CACHED = Symbol('cached');

interface FileModule {
  module: any,
  filename: string
}

export class Loader {

  private app: Kaze;
  private router: any = new Router;

  constructor(app: Kaze) {
    this.app = app;
  }

  private appDir(): string {
    return path.resolve(__dirname, '../../../dist');
  }

  private fileLoader(url: string): Array<FileModule> {
    const dir = this.appDir() + url;
    return fs.readdirSync(dir).map((name) => {
      return {
        module: require(`${dir}/${name}`).default,
        filename: name,
      }
    });
  }

  private loadToContext(target: Array<FileModule>, app: Kaze, property: string) {
    Object.defineProperty(app.context, property, {
      get() {
        // cach property
        if (!(<any>this)[CACHED]) {
          (<any>this)[CACHED] = {};
        }
        const cached = (<any>this)[CACHED];
        if (!cached[property]) {
          cached[property] = {};
          target.forEach((mod) => {
            const key = mod.filename.split('.')[0];
            cached[property][key] = new mod.module(this, app);
          });
        }
        return cached[property];
      }
    })

  }

  loadController() {
    this.fileLoader('/controller');
  }

  loadService() {
    const services = this.fileLoader('/service');
    this.loadToContext(services, this.app, 'service');
  }

  loadConfig() {
    const configDef = this.appDir() + '/config/config.default.js';
    const configEnv = this.appDir() + (process.env.NODE_ENV == 'production' ? '/config/config.prod.js' : '/config/config.dev.js');
    const merge = Object.assign({}, require(configDef), require(configEnv));
    Object.defineProperty(this.app, 'config', {
      get() {
        return merge;
      }
    });
  }

  loadRouter() {
    const _routes = mapper.getRoutes();
    Object.keys(_routes).forEach((url) => {
      _routes[url].forEach((httpRoute) => {
        this.router[httpRoute.httpMethod](url, async (ctx: BaseContext) => {
          const controller = new httpRoute.constructor(ctx, this.app);
          await controller[httpRoute.handler]();
        });
      });
    });
    this.app.use(this.router.routes());
  }

  load() {
    this.loadConfig();
    this.loadController();
    this.loadService();
    this.loadRouter();
  }
}