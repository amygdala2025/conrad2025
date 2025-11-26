import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* basename은 기본값(/)로 두면 됨. custom domain에서도 / 를 그대로 쓴다 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
