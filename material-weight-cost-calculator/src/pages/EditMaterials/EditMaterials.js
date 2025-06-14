import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import {
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { fetchAllMaterials } from '../../utils/fetchMaterials';
import styles from './EditMaterials.module.css';

const EditMaterials = () => {
  const [materials, setMaterials] = useState([]);

  const fetchMaterials = async () => {
    const data = await fetchAllMaterials();
    setMaterials(data);
  };

  const handleDelete = async (materialId) => {
    await deleteDoc(doc(db, 'materials', materialId));
    await fetchMaterials();
  };

  const handleDeleteVariant = async (materialId, variantId) => {
    await deleteDoc(doc(db, 'materials', materialId, 'variants', variantId));
    await fetchMaterials();
  };

  const handleDeleteSubVariant = async (materialId, variantId, subVariantId) => {
    await deleteDoc(
      doc(db, 'materials', materialId, 'variants', variantId, 'subVariants', subVariantId)
    );
    await fetchMaterials();
  };

  const handleEditMaterial = async (material) => {
    const newName = prompt('Enter new material name:', material.name);
    if (!newName) return;

    const updateData = { name: newName };

    if (!material.hasSubMaterials) {
      if (material.type === 'length-based') {
        const newWeight = parseFloat(prompt('Enter new weight per meter (kg):', material.weightPerMeter));
        if (!isNaN(newWeight)) updateData.weightPerMeter = newWeight;
      } else {
        const newDensity = parseFloat(prompt('Enter new density (g/cm³):', material.density));
        if (!isNaN(newDensity)) updateData.density = newDensity;
      }
    }

    await updateDoc(doc(db, 'materials', material.id), updateData);
    await fetchMaterials();
  };

  const handleEditVariant = async (materialId, material, variant) => {
    const newName = prompt('Enter new sub material name:', variant.name);
    if (!newName) return;

    const updateData = { name: newName };

    if (!material.hasSubSubMaterials) {
      if (material.type === 'length-based') {
        const newWeight = parseFloat(prompt('Enter new weight per meter (kg):', variant.weightPerMeter));
        if (!isNaN(newWeight)) updateData.weightPerMeter = newWeight;
      } else {
        const newDensity = parseFloat(prompt('Enter new density (g/cm³):', variant.density));
        if (!isNaN(newDensity)) updateData.density = newDensity;
      }
    }

    await updateDoc(doc(db, 'materials', materialId, 'variants', variant.id), updateData);
    await fetchMaterials();
  };

  const handleEditSubVariant = async (materialId, variantId, sub) => {
    const newName = prompt('Enter new sub-sub material name:', sub.name);
    if (!newName) return;

    const newWeight = parseFloat(prompt('Enter new weight per meter (kg):', sub.weightPerMeter));
    if (isNaN(newWeight)) return;

    await updateDoc(
      doc(db, 'materials', materialId, 'variants', variantId, 'subVariants', sub.id),
      { name: newName, weightPerMeter: newWeight }
    );
    await fetchMaterials();
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Edit/Delete Materials</h2>
      {materials.map((material) => (
        <div key={material.id} className={styles.materialCard}>
          <div className={styles.materialHeader}>
            <h3>{material.name}</h3>
            <div>
              <button
                onClick={() => handleEditMaterial(material)}
                className={styles.editButton}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(material.id)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
          <p><strong>Type:</strong> {material.type}</p>
          <p>
            <strong>Structure:</strong> {material.hasSubMaterials ? 'Has Sub-Materials' : 'No Sub-Materials'}
            {material.hasSubMaterials && material.hasSubSubMaterials ? ' → Has Sub-SubMaterials' : ''}
          </p>

          {!material.hasSubMaterials ? (
            <p>
              {material.type === 'length-based'
                ? `Weight per Meter: ${material.weightPerMeter} kg/m`
                : `Density: ${material.density} g/cm³`}
            </p>
          ) : (
            <div className={styles.variantSection}>
              {material.variants.map((variant) => (
                <div key={variant.id} className={styles.variantCard}>
                  <div className={styles.variantHeader}>
                    <strong>{variant.name}</strong>
                    <div>
                      <button
                        onClick={() => handleEditVariant(material.id, material, variant)}
                        className={styles.editButtonSmall}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(material.id, variant.id)}
                        className={styles.deleteButtonSmall}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {material.hasSubSubMaterials ? (
                    <div className={styles.subVariants}>
                      {variant.subVariants.map((sub) => (
                        <div key={sub.id} className={styles.subVariantRow}>
                          <span>
                            {sub.name} — Weight per Meter: {sub.weightPerMeter} kg/m
                          </span>
                          <div>
                            <button
                              onClick={() =>
                                handleEditSubVariant(material.id, variant.id, sub)
                              }
                              className={styles.editButtonSmall}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSubVariant(material.id, variant.id, sub.id)
                              }
                              className={styles.deleteButtonSmall}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {material.type === 'length-based'
                        ? `Weight per Meter: ${variant.weightPerMeter} kg/m`
                        : `Density: ${variant.density} g/cm³`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditMaterials;
