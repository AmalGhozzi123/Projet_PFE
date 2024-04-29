import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaLock, FaHome, FaExclamationCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import "./SignUp.css";
import { ROUTES } from "@utils";

interface FormState {
    nom: string;
    prenom: string;
    email: string;
    adresse: string;
    Tel: string;
    motDePasse: string;
    verificationMotDePasse: string;
}

const SignUp: React.FC = () => {
    const [formData, setFormData] = useState<FormState>({
        nom: '',
        prenom: '',
        email: '',
        adresse: '',
        Tel: '',
        motDePasse: '',
        verificationMotDePasse: ''
    });
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isValid =
            formData.motDePasse === formData.verificationMotDePasse &&
            formData.motDePasse.length > 0 &&
            formData.email.includes('@') &&
            formData.Tel.length === 8;
        setIsFormValid(isValid);
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isFormValid) {
            try {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    setShowDialog(true);
                } else {
                    console.error('Erreur lors de l\'inscription :', await response.text());
                    setErrorMessage('Erreur lors de l\'inscription. Veuillez réessayer.');
                }
            } catch (error) {
                console.error('Erreur lors de l\'inscription :', error);
                setErrorMessage('Erreur lors de l\'inscription. Veuillez réessayer.');
            }
        } else {
            setErrorMessage('Veuillez remplir tous les champs correctement.');
        }
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        navigate(ROUTES.LOGIN);
    };

    return (
        <body>
            <Link to={ROUTES.LOGIN}><FaHome className="home-icon" /></Link>

            <form className="sign-up-form" onSubmit={handleSubmit}>
                <div className="header">
                    <div className="title">Inscription</div>
                </div>
                <div className="error-message">
                    {errorMessage && <><FaExclamationCircle className="error-icon" /> <span>{errorMessage}</span></>}
                </div>
                <div className="input-container">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Nom"
                        required
                    />
                    {formData.nom === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Prénom"
                        required
                    />
                    {formData.prenom === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Adresse mail"
                        required
                    />
                    {formData.email === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaMapMarkerAlt className="icon" />
                    <input
                        type="text"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        placeholder="Adresse"
                        required
                    />
                    {formData.adresse === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaPhone className="icon" />
                    <input
                        type="text"
                        name="Tel"
                        value={formData.Tel}
                        onChange={handleChange}
                        placeholder="Numéro de téléphone"
                        required
                    />
                    {formData.Tel === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        name="motDePasse"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        placeholder="Mot de Passe"
                        required
                    />
                    {formData.motDePasse === '' && <span className="required-field"></span>}
                </div>
                <div className="input-container">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        name="verificationMotDePasse"
                        value={formData.verificationMotDePasse}
                        onChange={handleChange}
                        placeholder="Vérification du mot de passe"
                        required
                    />
                    {formData.verificationMotDePasse === '' && <span className="required-field"></span>}
                </div>
                <button type="submit">S'inscrire</button>
            </form>

            {showDialog && (
                <div className="dialog">
                    <h2>Confirmation de création de compte</h2>
                    <p>Veuillez vérifier votre <b><i>Email</i></b> pour confirmer la création de compte.</p>
                    <button onClick={handleCloseDialog}>Fermer</button>
                </div>
            )}
        </body>
    );
};

export default SignUp;
