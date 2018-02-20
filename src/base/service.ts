import { BaseContext } from "koa";
import { Kaze } from "../kaze";

export class Service {
  ctx: BaseContext;
  app: Kaze;
  constructor(ctx: BaseContext, app: Kaze) {
    this.ctx = ctx;
    this.app = app;
  }
}
