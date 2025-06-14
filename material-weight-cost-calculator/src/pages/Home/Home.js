import React, { useEffect, useState } from 'react';
import Calculator from '../../components/Calculator/Calculator';
import { fetchAllMaterials } from '../../utils/fetchMaterials';
import styles from './Home.module.css';

const Home = () => {
  const [materials, setMaterials] = useState([]);

  const fetchMaterials = async () => {
    const data = await fetchAllMaterials();
    setMaterials(data);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Material Weight Calculator</h2>
      <Calculator />
    </div>
  );
};

export default Home;
