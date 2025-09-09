import express from 'express';
import { NotFoundMiddleware } from "./middleware/NotFoundMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import router from './routes/router.js';

const app = express();


// #region MIDDLEWARES

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));

// #endregion

// #region VIEW ENGINE

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));
app.use(express.static(join(__dirname, 'public')));

// #endregion


// #region ROUTES

app.use("/", router);

// #endregion

NotFoundMiddleware(app); // This middleware should go at the very end before app.listen

app.listen(8080, () => {
    console.log('server is running on port 8080')
})