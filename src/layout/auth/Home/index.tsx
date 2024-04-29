import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Home.css";

export const Home = () => {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", isActive);
    return () => {
      window.removeEventListener("scroll", isActive);
    };
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={active || pathname !== "/" ? "interise-navbar active" : "interise-navbar"}>
      <div className="container">
        <div className="logo">
          <Link className="link" to="/" style={{ color: "#090e48" }}>
            <span className="text"><p>Interise.io</p></span>
          </Link>
          <span className="dot">  </span>
        </div>
        <div className="links">
          <Link className="link" to="/about">A propos</Link>
          <Link className="link" to="/solutions">Solutions</Link>
          <Link className="link" to="/pricing">Tarifs</Link>
          <Link className="link" to="/blog">Blog</Link>
          <Link className="link" to="/contact">Contact</Link>
          <button className="login-button" onClick={handleLogout}>Connexion</button>
        </div>
      </div>
      {(active || pathname !== "/") && (
        <>
          <hr />
          <div className="menu">
            {/* Ajoutez ici le contenu continu de votre page d'accueil */}
            <h1>Bienvenue sur Interise.io</h1>
            <p><b><i>Interise.io</i></b> est une plateforme innovante offrant de veille du web et des réseaux sociaux. Découvrez nos fonctionnalités, nos tarifs compétitifs et notre blog pour rester informé sur les dernières tendances du secteur.</p>
          </div>
          <hr />
        </>
      )}
    </div>
  );
}

export default Home;
