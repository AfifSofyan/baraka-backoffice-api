export default class RouteList {
    constructor(method, path, func, middleware = null){
        this.method = method;
        this.path = path;
        this.func = func;
        this.middleware = middleware;
    }
}   