// src/pages/AllMaterials/AllMaterials.js

import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import styles from './AllMaterials.module.css';

const AllMaterials = () => {
  const [materials, setMaterials] = useState([]);

  const fetchMaterials = async () => {
    const snapshot = await getDocs(collection(db, 'materials'));
    const data = [];

    for (const docSnap of snapshot.docs) {
      const matData = docSnap.data();
      const material = {
        id: docSnap.id,
        ...matData,
        variants: [],
      };

      if (matData.hasSubMaterials) {
        const variantSnap = await getDocs(collection(db, 'materials', docSnap.id, 'variants'));

        for (const varDoc of variantSnap.docs) {
          const variant = { id: varDoc.id, ...varDoc.data(), subVariants: [] };

          if (matData.hasSubSubMaterials) {
            const subVarSnap = await getDocs(
              collection(db, 'materials', docSnap.id, 'variants', varDoc.id, 'subVariants')
            );

            variant.subVariants = subVarSnap.docs.map((sub) => ({
              id: sub.id,
              ...sub.data(),
            }));
          }

          material.variants.push(variant);
        }
      }

      data.push(material);
    }

    setMaterials(data);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Materials</h2>
      <div className={styles.materialList}>
        {materials.map((material) => (
          <div key={material.id} className={styles.card}>
            <h4>{material.name}</h4>
            <p>Type: {material.type}</p>
            <p>
              Structure: {material.hasSubMaterials ? 'Sub-Materials' : 'Direct Material'}
              {material.hasSubMaterials && material.hasSubSubMaterials ? ' → Sub-SubMaterials' : ''}
            </p>

            {!material.hasSubMaterials ? (
              <p>
                {material.type === 'length-based'
                  ? `Weight/m: ${material.weightPerMeter}`
                  : `Density: ${material.density}`}
              </p>
            ) : (
              <div className={styles.variantList}>
                {material.variants.map((variant) => (
                  <div key={variant.id} className={styles.variantItem}>
                    <strong>{variant.name}</strong>
                    {material.hasSubSubMaterials ? (
                      <ul className={styles.subVariantList}>
                        {variant.subVariants.map((sub) => (
                          <li key={sub.id} className={styles.subVariantItem}>
                            {sub.name} — Weight/m: {sub.weightPerMeter}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        {material.type === 'length-based'
                          ? `Weight/m: ${variant.weightPerMeter}`
                          : `Density: ${variant.density}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMaterials;
