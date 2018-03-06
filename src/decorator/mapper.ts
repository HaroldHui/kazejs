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

interface FunctionDecorator {
  (target: any, name: string): void
}

interface ClassDecorator {
  (constructor: Function): void
}


export interface RestMapper extends Mapper {
  post(url: string): FunctionDecorator;
  get(url: string): FunctionDecorator;
  delete(url: string): FunctionDecorator;
  put(url: string): FunctionDecorator;
  rest(url: string): ClassDecorator;
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

  rest(url: string) {
    return (constructor: Function) => {
      // get update delete, post all
      ['get', 'update', 'delete'].forEach((method) => {
        const handler = constructor.prototype[method];
        if (handler) {
          (<any>this).setRoute(url + '/:id', {
            httpMethod: method,
            constructor: constructor,
            handler: method,
          });
        }
      });
      if (constructor.prototype['all']) {
        (<any>this).setRoute(url, {
          httpMethod: 'get',
          constructor: constructor,
          handler: 'all',
        });
      }
      if (constructor.prototype['post']) {
        (<any>this).setRoute(url, {
          httpMethod: 'post',
          constructor: constructor,
          handler: 'post',
        });
      }
    }
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