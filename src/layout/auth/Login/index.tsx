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
    if (username === "amal" && password === "amal") {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [username, password]);

  return (
    <div className={`${styles.login_container} login-page-inputs`}>

<div className={styles.login_form}>
        <h1>Connexion</h1>
        <form>
          <Input
            type="text"
            label="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <img src="icons/user_icon.svg" className={styles.user_icon}></img>

          <Input
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img src="icons/password_icon.svg" className={styles.password_icon}></img>
          <button
            onClick={handleSubmit}
            disabled={!enabled}
            className={enabled ? styles.enabled_button : styles.disabled_button}
         
          >
  <strong>Se connecter</strong>

          </button>
        </form>
      </div>
    </div>
  );
};
