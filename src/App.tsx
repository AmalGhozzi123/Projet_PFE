//src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, Dashboard } from "@layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
