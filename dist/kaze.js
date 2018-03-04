"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const loader_1 = require("./loader");
const controller_1 = require("./base/controller");
const mapper_1 = require("./decorator/mapper");
const service_1 = require("./base/service");
class Kaze extends Koa {
    constructor() {
        super();
        this.config = {};
        this.loader = new loader_1.Loader(this);
        this.port = 3000;
        this.ip = '127.0.0.1';
    }
    loadDefaultMiddleware() {
        const bodyParser = require('koa-bodyparser');
        this.use(bodyParser());
    }
    run(port, ip) {
        port = port || this.port;
        ip = ip || this.ip;
        this.loadDefaultMiddleware();
        this.loader.load();
        return this.listen(port, ip, () => {
            console.log(`Server is run on ${ip}:${port}`);
        });
    }
}
Kaze.Controller = controller_1.Controller;
Kaze.Service = service_1.Service;
Kaze.mapper = mapper_1.mapper;
exports.Kaze = Kaze;
