import React, { useState, FormEvent } from "react";
import axios from 'axios';
import { Input } from "@components"; // Assurez-vous que ce chemin est correct
import styles from "./login.module.css";
import { useNavigate, Link } from "react-router-dom"; // Importer Link
import { ROUTES } from "@utils"; // Assurez-vous que ce chemin est correct
import { FaEnvelope, FaLock } from 'react-icons/fa';

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: username,
        motDePasse: password
      });
      if (response.data) {
        setEnabled(true);
        navigate(ROUTES.DASHBOARD);
      } else {
        setEnabled(false);
        setError("Invalid username or password");
      }
    } catch (err: any) {
      setEnabled(false);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Email et|ou Mot de passe incorrecte !!!");
      } else {
        setError("Email et|ou Mot de passe incorrecte !!!");
      }
    }
  };

  return (
    <div className={`${styles.login_container} login-page-inputs`}>
    <div className={styles.login_form}>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.input_container}>
          <FaEnvelope className={styles.icon} />
          <Input
            type="text"
            label="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.input_container}>
          <FaLock className={styles.icon} />
          <Input
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className={enabled ? styles.blue_button : styles.disabled_button}>
          Se connecter
        </button>
        {error && <p className={styles.error_message}>{error}</p>}
        <p className={styles.register_prompt}>
          Pas encore membre? <Link to={ROUTES.SignUp}>Inscrivez-vous maintenant</Link>
        </p>
      </form>
    </div>
  </div>
  );
};
