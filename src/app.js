import "./styles/style.scss";
import {Router} from "./router.js";

class App {
    constructor() {
        new Router();
    }
}

(new App());