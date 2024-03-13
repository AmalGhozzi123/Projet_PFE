import React, { useEffect, useState } from "react";

import { Input } from "@components";
import styles from "./login.module.css";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@utils";

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState<boolean>(false);

  const handleSubmit = () => {
    navigate(ROUTES.DASHBOARD);
  };

  useEffect(() => {
    if (username === "malek" && password === "malek") {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [username, password]);

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form}>
        <h1>Login</h1>
        <form>
          <Input
            type="text"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            disabled={!enabled}
            className={enabled ? styles.enabled_button : styles.disabled_button}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
