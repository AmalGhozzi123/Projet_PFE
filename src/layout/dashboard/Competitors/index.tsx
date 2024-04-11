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

  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

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
            title="Tous Les Concurrents"
            value={competitors.length}
            icon="/icons/competitor.svg"
      
          />
        </div>

  

        <table>
          <thead>
              <th>Logo</th>
              <th>Nom</th>
              <th>Lien</th>
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
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default Competitors;
