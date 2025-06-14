import { useState } from 'react';
import styles from './MaterialForm.module.css';

export default function MaterialForm({ onSubmit }) {
  const [material, setMaterial] = useState({
    name: '',
    type: 'length-based',
    weightPerMeter: '',
    density: '',
    hasSubMaterials: false,
    hasSubSubMaterials: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For boolean dropdowns
    if (name === 'hasSubMaterials' || name === 'hasSubSubMaterials') {
      setMaterial({ ...material, [name]: value === 'true' });
    } else {
      setMaterial({ ...material, [name]: value });
    }
  };

  const submitForm = () => {
    const formatted = {
      name: material.name,
      type: material.type,
      hasSubMaterials: material.hasSubMaterials,
      hasSubSubMaterials: material.hasSubMaterials ? material.hasSubSubMaterials : false,
    };

    if (!material.hasSubMaterials) {
      if (material.type === 'length-based') {
        formatted.weightPerMeter = parseFloat(material.weightPerMeter);
      } else {
        formatted.density = parseFloat(material.density);
      }
    }

    onSubmit(formatted);

    // Clear form
    setMaterial({
      name: '',
      type: 'length-based',
      weightPerMeter: '',
      density: '',
      hasSubMaterials: false,
      hasSubSubMaterials: false,
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add New Material</h2>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Material Name</label>
        <input
          name="name"
          placeholder="Enter material name"
          value={material.name}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Material Type</label>
        <select
          name="type"
          value={material.type}
          onChange={handleChange}
          className={styles.input}
        >
          <option value="length-based">Length-Based</option>
          <option value="volume-based">Volume-Based</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Has Sub-Materials?</label>
        <select
          name="hasSubMaterials"
          value={material.hasSubMaterials}
          onChange={handleChange}
          className={styles.input}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      {material.hasSubMaterials && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Has Sub-SubMaterials?</label>
          <select
            name="hasSubSubMaterials"
            value={material.hasSubSubMaterials}
            onChange={handleChange}
            className={styles.input}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      )}

      {!material.hasSubMaterials && material.type === 'length-based' && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Weight per Meter (kg)</label>
          <input
            name="weightPerMeter"
            placeholder="e.g. 12.5"
            value={material.weightPerMeter}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      )}

      {!material.hasSubMaterials && material.type === 'volume-based' && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Density (g/cm³)</label>
          <input
            name="density"
            placeholder="e.g. 7.85"
            value={material.density}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
      )}

      <button onClick={submitForm} className={styles.button}>
        Add Material
      </button>
    </div>
  );
}
