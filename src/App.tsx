//src/App.tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login, Dashboard , SignUp , Home} from "@layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
