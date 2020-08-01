import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
// const rootElement = document.getElementById("root");
// ReactDOM.render(<App />, rootElement);
const rootElement = document.getElementById("root");
ReactDOM.unstable_createRoot(rootElement).render(<App />);
