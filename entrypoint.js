import { BooksUI } from "./books-ui.js";
import { Api } from "./api.js";
import { CollapseHelper } from "./collapse-helper.js";

new BooksUI(new Api(), new CollapseHelper());