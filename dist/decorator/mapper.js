"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Mapper {
    constructor() {
        this.routes = {};
    }
    setRoute(url, route) {
        const _router = this.routes[url];
        if (_router) {
            _router.forEach((httpRoute) => {
                if (httpRoute.httpMethod === route.httpMethod) {
                    console.error(`Route ${route.httpMethod} ${url} already exist`);
                    return;
                }
                this.routes[url].push(route);
            });
        }
        else {
            this.routes[url] = [];
            this.routes[url].push(route);
        }
    }
    getRoutes() {
        return this.routes;
    }
    rest(url) {
        return (constructor) => {
            // get update delete, post all
            ['get', 'update', 'delete'].forEach((method) => {
                const handler = constructor.prototype[method];
                if (handler) {
                    this.setRoute(url + '/:id', {
                        httpMethod: method,
                        constructor: constructor,
                        handler: method,
                    });
                }
            });
            if (constructor.prototype['all']) {
                this.setRoute(url, {
                    httpMethod: 'get',
                    constructor: constructor,
                    handler: 'all',
                });
            }
            if (constructor.prototype['post']) {
                this.setRoute(url, {
                    httpMethod: 'post',
                    constructor: constructor,
                    handler: 'post',
                });
            }
        };
    }
}
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach((httpMethod) => {
    Object.defineProperty(Mapper.prototype, httpMethod, {
        get: function () {
            return (url) => {
                return (target, name) => {
                    this.setRoute(url, {
                        httpMethod: httpMethod,
                        constructor: target.constructor,
                        handler: name,
                    });
                };
            };
        }
    });
});
exports.mapper = new Mapper;
