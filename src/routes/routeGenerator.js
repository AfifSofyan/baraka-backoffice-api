import apiMethod from "../utils/constants/apiMethod.js";

export const generateRoutes  = (basePath, router, routes) => {
    routes.forEach(route => {
        if(route.method === apiMethod.GET){
            if(route.middleware){
                router.get(`${basePath}${route.path}`, route.middleware, route.func);    
            }else{
                router.get(`${basePath}${route.path}`, route.func);
            }
        }
        else if(route.method === apiMethod.POST){
            if(route.middleware){
                router.post(`${basePath}${route.path}`, route.middleware, route.func);    
            }else{
                router.post(`${basePath}${route.path}`, route.func);
            }
        }
        else if(route.method === apiMethod.PUT){
            if(route.middleware){
                router.put(`${basePath}${route.path}`, route.middleware, route.func);    
            }else{
                router.put(`${basePath}${route.path}`, route.func);
            }
        }
        else if(route.method === apiMethod.PATCH){
            if(route.middleware){
                router.patch(`${basePath}${route.path}`, route.middleware, route.func);    
            }else{
                router.patch(`${basePath}${route.path}`, route.func);
            }
        }
        else if(route.method === apiMethod.DELETE){
            if(route.middleware){
                router.delete(`${basePath}${route.path}`, route.middleware, route.func);    
            }else{
                router.delete(`${basePath}${route.path}`, route.func);
            }
        }
    })

    return router;
}