"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Router = require("koa-router");
const mapper_1 = require("./decorator/mapper");
const CACHED = Symbol('cached');
class Loader {
    constructor(app) {
        this.router = new Router;
        this.app = app;
    }
    appDir() {
        return path.resolve(__dirname, '../../../dist');
    }
    fileLoader(url) {
        const dir = this.appDir() + url;
        return fs.readdirSync(dir).map((name) => {
            return {
                module: require(`${dir}/${name}`).default,
                filename: name,
            };
        });
    }
    loadToContext(target, app, property) {
        Object.defineProperty(app.context, property, {
            get() {
                // cach property
                if (!this[CACHED]) {
                    this[CACHED] = {};
                }
                const cached = this[CACHED];
                if (!cached[property]) {
                    cached[property] = {};
                    target.forEach((mod) => {
                        const key = mod.filename.split('.')[0];
                        cached[property][key] = new mod.module(this, app);
                    });
                }
                return cached[property];
            }
        });
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
        const _routes = mapper_1.mapper.getRoutes();
        Object.keys(_routes).forEach((url) => {
            _routes[url].forEach((httpRoute) => {
                this.router[httpRoute.httpMethod](url, async (ctx) => {
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
exports.Loader = Loader;
