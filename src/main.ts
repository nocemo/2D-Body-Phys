import { App } from "./app/App";
import "./style.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("App root element was not found.");
}

const app = new App(root);
app.mount();
