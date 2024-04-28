import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../dashboard.module.css';
import { Input } from '@components';
import { DashboardComponents } from '@components';

interface Competitor {
  _id?: string;
  Logo: string;
  Name: string;
  Link: string;
}

const Competitors: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState<boolean>(true);
  const [newCompetitor, setNewCompetitor] = useState<Competitor>({
    Logo: '',
    Name: '',
    Link: ''
  });
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = useCallback(() => {
    setLoadingCompetitors(true);

    axios
      .get('http://localhost:5000/api/competitors')
      .then((response) => {
        const data: Competitor[] = response.data;
        setCompetitors(data);
        setLoadingCompetitors(false);
      })
      .catch((error) => {
        console.error('Error fetching competitors:', error);
        setLoadingCompetitors(false);
      });
  }, []);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    if (value === "") {
      fetchCompetitors();
    } else {
      const filteredCompetitors = competitors.filter((competitor: Competitor) =>
        competitor.Name.toLowerCase().includes(value.toLowerCase())
      );
      setCompetitors(filteredCompetitors);
    }
  }, [competitors, fetchCompetitors]);

  const addCompetitor = () => {
    axios
      .post('http://localhost:5000/api/competitors', newCompetitor)
      .then(() => {
        setNewCompetitor({ Logo: '', Name: '', Link: '' });
        fetchCompetitors();
        setShowAddDialog(false);
      })
      .catch((error) => {
        console.error('Error adding competitor:', error);
      });
  };

  const deleteCompetitor = (id: string) => {
    axios
      .delete(`http://localhost:5000/api/competitors/${id}`)
      .then(() => {
        fetchCompetitors();
      })
      .catch((error) => {
        console.error('Error deleting competitor:', error);
      });
  };

  const updateCompetitor = () => {
    if (selectedCompetitor) {
      axios
        .put(`http://localhost:5000/api/competitors/${selectedCompetitor._id}`, selectedCompetitor)
        .then(() => {
          fetchCompetitors();
          setShowUpdateDialog(false);
          setSelectedCompetitor(null);
        })
        .catch((error) => {
          console.error('Error updating competitor:', error);
        });
    }
  };

  const handleDeleteConfirmation = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      const enteredName = (document.getElementById('competitorName') as HTMLInputElement)?.value;
      const competitorToDelete = competitors.find(competitor => competitor._id === confirmDeleteId);
      if (enteredName === competitorToDelete?.Name) {
        deleteCompetitor(confirmDeleteId);
        setConfirmDeleteId(null);
      } else {
        alert("Le nom entré ne correspond pas au nom du concurrent à supprimer. Veuillez réessayer.");
      }
    }
  };
  

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className={`${styles.dashboard_content} products_page product-page-inputs`}>
    <div className={styles.dashboard_content_container}>
      <div className={styles.dashboard_content_header}>
      <Input
            type="text"
            value={search}
            label="Chercher.."
            onChange={(e) => handleSearch(e)}
          />
           <img
      src="/icons/search.gif"
      className={styles.search_icon}/>
        </div>

        <div className={styles.dashboard_content_cards}>
          <DashboardComponents.StatCard
            title="Tous Les Competiteurs"
            value={competitors.length}
            icon="/icons/competitor.svg"
          />
        </div>

        <div>
          <h3>Ajouter un Concurrent</h3>
          <button className={styles.customButton} onClick={() => setShowAddDialog(true)}>Ajouter</button>
        </div>

        <table>
          <thead>
              <th>Logo</th>
              <th>Nom</th>
              <th>Lien</th>
              <th>Actions</th>
          </thead>
          <tbody>
            {competitors.map((competitor: Competitor, index: number) => (
              <tr key={index}>
                <td>
                  <img src={competitor.Logo} alt={competitor.Name} />
                </td>
                <td>{competitor.Name}</td>
                <td>
                  <a href={competitor.Link} target="_blank" rel="noopener noreferrer">
                    {competitor.Link}
                  </a>
                </td>
                <td>
                  <button className={`${styles.customButton} ${styles.deleteButton}`} onClick={() => handleDeleteConfirmation(competitor._id!)}>Supprimer</button>
                  <button className={`${styles.customButton} ${styles.updateButton}`} onClick={() => { setSelectedCompetitor(competitor); setShowUpdateDialog(true); }}>Modifier</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddDialog && (
  <div className={styles.dialogContainer}>
    <div className={styles.dialog}>
      <h2>Ajouter un Concurrent</h2>
      <div>
        <input type="text" value={newCompetitor.Logo} onChange={(e) => setNewCompetitor({ ...newCompetitor, Logo: e.target.value })} placeholder="Logo URL" />
      </div>
      <div>
        <input type="text" value={newCompetitor.Name} onChange={(e) => setNewCompetitor({ ...newCompetitor, Name: e.target.value })} placeholder="Nom" />
      </div>
      <div>
        <input type="text" value={newCompetitor.Link} onChange={(e) => setNewCompetitor({ ...newCompetitor, Link: e.target.value })} placeholder="Lien" />
      </div>
      <div>
        <button className={styles.customButton} onClick={addCompetitor}>Ajouter</button>
        <button className={`${styles.customButton} ${styles.cancelButton}`} onClick={() => setShowAddDialog(false)}>Annuler</button>

      </div>
    </div>
  </div>
)}

{showUpdateDialog && (
  <div className={styles.dialogContainer}>
    <div className={styles.dialog}>
      <h2>Modifier le Concurrent</h2>
      <div>
        <input type="text" value={selectedCompetitor?.Logo || ''} onChange={(e) => setSelectedCompetitor(prevState => prevState ? { ...prevState, Logo: e.target.value } : null)} placeholder="Logo URL" />
      </div>
      <div>
        <input type="text" value={selectedCompetitor?.Name || ''} onChange={(e) => setSelectedCompetitor(prevState => prevState ? { ...prevState, Name: e.target.value } : null)} placeholder="Nom" />
      </div>
      <div>
        <input type="text" value={selectedCompetitor?.Link || ''} onChange={(e) => setSelectedCompetitor(prevState => prevState ? { ...prevState, Link: e.target.value } : null)} placeholder="Lien" />
      </div>
      <div>
        <button className={styles.customButton} onClick={updateCompetitor}>Modifier</button>
        <button className={`${styles.customButton} ${styles.cancelButton}`} onClick={() => setShowUpdateDialog(false)}>Annuler</button>

      </div>
    </div>
  </div>
)}

{confirmDeleteId && (
  <div className={styles.dialogContainer}>
    <div className={styles.dialog}>
      <h2>Confirmation de Suppression</h2>
      <span className={styles.filter_label}>Tapez " {confirmDeleteId ? (competitors.find(competitor => competitor._id === confirmDeleteId)?.Name || 'Aucun concurrent') : 'Aucun concurrent'} " pour supprimer ce concurrent</span>

      <input type="text" placeholder="Nom du concurrent" id="competitorName" />
      <div>
        <button className={`${styles.customButton} ${styles.confirmButton}`} onClick={handleDeleteConfirm}>Confirmer</button>
        <button className={`${styles.customButton} ${styles.cancelButton}`} onClick={handleDeleteCancel}>Annuler</button>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default Competitors;
