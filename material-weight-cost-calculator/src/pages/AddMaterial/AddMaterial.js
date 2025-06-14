import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import styles from './AddMaterial.module.css';

const AddMaterial = () => {
  const [materialName, setMaterialName] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [hasSubMaterials, setHasSubMaterials] = useState(false);
  const [hasSubSubMaterials, setHasSubSubMaterials] = useState(false);

  const [variants, setVariants] = useState([
    {
      name: '',
      subVariants: [{ name: '', weightPerMeter: '' }],
      weightPerMeter: '',
      density: ''
    }
  ]);

  const [weightPerMeter, setWeightPerMeter] = useState('');
  const [density, setDensity] = useState('');

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        subVariants: [{ name: '', weightPerMeter: '' }],
        weightPerMeter: '',
        density: ''
      }
    ]);
  };

  const handleVariantChange = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  const handleSubVariantChange = (variantIndex, subIndex, key, value) => {
    const updated = [...variants];
    updated[variantIndex].subVariants[subIndex][key] = value;
    setVariants(updated);
  };

  const handleAddSubVariant = (variantIndex) => {
    const updated = [...variants];
    updated[variantIndex].subVariants.push({ name: '', weightPerMeter: '' });
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const materialRef = doc(collection(db, 'materials'));
    const baseData = {
      name: materialName,
      type: materialType,
      hasSubMaterials,
      hasSubSubMaterials
    };

    if (hasSubMaterials) {
      await setDoc(materialRef, baseData);

      for (const variant of variants) {
        const variantRef = await addDoc(collection(materialRef, 'variants'), {
          name: variant.name
        });

        if (hasSubSubMaterials) {
          for (const sub of variant.subVariants) {
            await addDoc(collection(variantRef, 'subVariants'), {
              name: sub.name,
              weightPerMeter: parseFloat(sub.weightPerMeter)
            });
          }
        } else {
          const data =
            materialType === 'length-based'
              ? { weightPerMeter: parseFloat(variant.weightPerMeter) }
              : { density: parseFloat(variant.density) };

          await setDoc(variantRef, { ...data, name: variant.name });
        }
      }
    } else {
      const directData =
        materialType === 'length-based'
          ? { ...baseData, weightPerMeter: parseFloat(weightPerMeter) }
          : { ...baseData, density: parseFloat(density) };

      await setDoc(materialRef, directData);
    }

    alert('Material added successfully!');
    setMaterialName('');
    setMaterialType('');
    setHasSubMaterials(false);
    setHasSubSubMaterials(false);
    setVariants([
      {
        name: '',
        subVariants: [{ name: '', weightPerMeter: '' }],
        weightPerMeter: '',
        density: ''
      }
    ]);
    setWeightPerMeter('');
    setDensity('');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Add New Material</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Material Name:</label>
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Material Type:</label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            required
            className={styles.input}
          >
            <option value="">--Select--</option>
            <option value="length-based">Length-based (kg/m)</option>
            <option value="volume-based">Volume-based (g/cm³)</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Has Sub-Materials?</label>
          <select
            value={hasSubMaterials}
            onChange={(e) => setHasSubMaterials(e.target.value === 'true')}
            required
            className={styles.input}
          >
            <option value="">--Select--</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {hasSubMaterials && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Has Sub-SubMaterials?</label>
            <select
              value={hasSubSubMaterials}
              onChange={(e) => setHasSubSubMaterials(e.target.value === 'true')}
              required
              className={styles.input}
            >
              <option value="">--Select--</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        )}

        {hasSubMaterials ? (
          <div className={styles.subSection}>
            <h4 className={styles.subTitle}>Sub-Materials:</h4>
            {variants.map((variant, index) => (
              <div key={index} className={styles.variantRow}>
                <input
                  type="text"
                  placeholder="Subcategory Name"
                  value={variant.name}
                  onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                  required
                  className={styles.inputSmall}
                />

                {hasSubSubMaterials ? (
                  <div className={styles.subVariants}>
                    {variant.subVariants.map((sub, subIndex) => (
                      <div key={subIndex} className={styles.variantRow}>
                        <input
                          type="text"
                          placeholder="Sub-Subcategory Name"
                          value={sub.name}
                          onChange={(e) =>
                            handleSubVariantChange(index, subIndex, 'name', e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                        <input
                          type="number"
                          placeholder="Weight/m (kg)"
                          step="0.01"
                          value={sub.weightPerMeter}
                          onChange={(e) =>
                            handleSubVariantChange(index, subIndex, 'weightPerMeter', e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddSubVariant(index)}
                      className={styles.buttonSecondary}
                    >
                      Add Sub-Subcategory
                    </button>
                  </div>
                ) : materialType === 'length-based' ? (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Weight/m (kg)"
                    value={variant.weightPerMeter}
                    onChange={(e) => handleVariantChange(index, 'weightPerMeter', e.target.value)}
                    required
                    className={styles.inputSmall}
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Density (g/cm³)"
                    value={variant.density}
                    onChange={(e) => handleVariantChange(index, 'density', e.target.value)}
                    required
                    className={styles.inputSmall}
                  />
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddVariant} className={styles.buttonSecondary}>
              Add Another Subcategory
            </button>
          </div>
        ) : (
          <div className={styles.fieldGroup}>
            {materialType === 'length-based' ? (
              <>
                <label className={styles.label}>Weight per Meter (kg/m):</label>
                <input
                  type="number"
                  step="0.01"
                  value={weightPerMeter}
                  onChange={(e) => setWeightPerMeter(e.target.value)}
                  required
                  className={styles.input}
                />
              </>
            ) : (
              <>
                <label className={styles.label}>Density (g/cm³):</label>
                <input
                  type="number"
                  step="0.01"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  required
                  className={styles.input}
                />
              </>
            )}
          </div>
        )}

        <button type="submit" className={styles.buttonPrimary}>
          Add Material
        </button>
      </form>
    </div>
  );
};

export default AddMaterial;
