interface Route {
  httpMethod: string,
  constructor: any,
  handler: string,
}

interface Routes {
  [key: string]: Array<{
    httpMethod: string,
    constructor: any,
    handler: string,
  }>
}

interface Decorator {
  (target: any, name: string): void
}

export interface RestMapper extends Mapper {
  post(url: string): Decorator;
  get(url: string): Decorator;
  delete(url: string): Decorator;
  put(url: string): Decorator;
}

class Mapper {
  routes: Routes = <Routes>{};

  setRoute(url: string, route: Route) {
    const _router = this.routes[url];
    if (_router) {
      _router.forEach((httpRoute) => {
        if (httpRoute.httpMethod === route.httpMethod) {
          console.error(`Route ${route.httpMethod} ${url} already exist`);
          return
        }
        this.routes[url].push(route);
      })

    } else {
      this.routes[url] = [];
      this.routes[url].push(route);
    }
  }

  getRoutes() {
    return this.routes;
  }
}

const methods = ['get', 'post', 'put', 'delete'];

methods.forEach((httpMethod) => {
  Object.defineProperty(Mapper.prototype, httpMethod, {
    get: function () {
      return (url: string) => {
        return (target: any, name: string) => {
          (<any>this).setRoute(url, {
            httpMethod: httpMethod,
            constructor: target.constructor,
            handler: name,
          });
        };
      };
    }
  });
});

export const mapper: RestMapper = <any>new Mapper;