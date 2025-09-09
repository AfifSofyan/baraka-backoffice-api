import NotFound from "../utils/errors/NotFound.js";
import { HandleError } from "../utils/errors/ErrorHandling.js";

export const NotFoundMiddleware = (app) => {
    return app.use((req, res) => {
        try {
            throw new NotFound();
        } catch (error) {
            HandleError(error, res);
        }
    })
}