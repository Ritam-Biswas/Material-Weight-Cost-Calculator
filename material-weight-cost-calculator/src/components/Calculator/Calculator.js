import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import styles from './Calculator.module.css';

const Calculator = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [subVariants, setSubVariants] = useState([]);
  const [selectedSubVariantId, setSelectedSubVariantId] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      const querySnapshot = await getDocs(collection(db, 'materials'));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterials(items);
    };

    fetchMaterials();
  }, []);

  const handleMaterialChange = async (id) => {
    setSelectedMaterialId(id);
    setSelectedVariantId('');
    setSelectedSubVariantId('');
    setLength('');
    setWidth('');
    setThickness('');
    setQuantity(1);
    setRate('');
    setResult(null);

    if (id) {
      const docRef = doc(db, 'materials', id);
      const materialSnap = await getDoc(docRef);
      if (materialSnap.exists()) {
        const materialData = materialSnap.data();
        setSelectedMaterial({ id, ...materialData });

        if (materialData.hasSubMaterials) {
          const variantsSnap = await getDocs(collection(docRef, 'variants'));
          const variantList = variantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setVariants(variantList);
        } else {
          setVariants([]);
        }

        setSubVariants([]);
      }
    }
  };

  const handleVariantChange = async (variantId) => {
    setSelectedVariantId(variantId);
    setSelectedSubVariantId('');
    if (!variantId || !selectedMaterial?.hasSubSubMaterials) {
      setSubVariants([]);
      return;
    }

    const variantRef = doc(db, 'materials', selectedMaterialId, 'variants', variantId);
    const subVariantsSnap = await getDocs(collection(variantRef, 'subVariants'));
    const subVariantList = subVariantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSubVariants(subVariantList);
  };


  const calculate = () => {
    if (!selectedMaterial) return;

    let weightPerUnit = 0;
    const type = selectedMaterial.type;

    const length_m = parseFloat(length || 0);
    const width_mm = parseFloat(width || 0);
    const thickness_mm = parseFloat(thickness || 0);
    const qty = parseInt(quantity || 1);
    const rate_per_kg = parseFloat(rate || 0);

    const length_mm = length_m * 1000; // for volume-based

    if (selectedMaterial.hasSubMaterials) {
      const variant = variants.find(v => v.id === selectedVariantId);
      if (!variant) return;

      if (selectedMaterial.hasSubSubMaterials) {
        const subvariant = subVariants.find(sv => sv.id === selectedSubVariantId);
        if (!subvariant) return;

        weightPerUnit =
          type === 'length-based'
            ? subvariant.weightPerMeter * length_m
            : ((length_mm * width_mm * thickness_mm) / 1000) * subvariant.density / 1000;
      } else {
        weightPerUnit =
          type === 'length-based'
            ? variant.weightPerMeter * length_m
            : ((length_mm * width_mm * thickness_mm) / 1000) * variant.density / 1000;
      }
    } else {
      if (type === 'length-based') {
        weightPerUnit = selectedMaterial.weightPerMeter * length_m;
      } else {
        const volume_cm3 = (length_mm * width_mm * thickness_mm) / 1000;
        const weight_grams = volume_cm3 * selectedMaterial.density;
        weightPerUnit = weight_grams / 1000;
      }
    }


    const totalWeight = weightPerUnit * qty;
    const totalCost = totalWeight * rate_per_kg;

    setResult({
      totalWeight: totalWeight.toFixed(2),
      totalCost: totalCost.toFixed(2),
    });
  };

  return (
    <div className={styles.container}>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Select Material:</label>
        <select
          value={selectedMaterialId}
          onChange={(e) => handleMaterialChange(e.target.value)}
          className={styles.select}
        >
          <option value="">-- Select --</option>
          {materials.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.name}
            </option>
          ))}
        </select>
      </div>

      {selectedMaterial?.hasSubMaterials && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Select Sub Material:</label>
          <select
            value={selectedVariantId}
            onChange={(e) => handleVariantChange(e.target.value)}
            className={styles.select}
          >
            <option value="">-- Select --</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMaterial?.hasSubSubMaterials && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Select Sub-Sub Material:</label>
          <select
            value={selectedSubVariantId}
            onChange={(e) => setSelectedSubVariantId(e.target.value)}
            className={styles.select}
          >
            <option value="">-- Select --</option>
            {subVariants.map((sv) => (
              <option key={sv.id} value={sv.id}>
                {sv.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMaterial?.type === 'length-based' && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Length (in m):</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className={styles.input}
          />
        </div>
      )}

      {selectedMaterial?.type === 'volume-based' && (
        <>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Length (in mm):</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Width (in mm):</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Thickness (in mm):</label>
            <input
              type="number"
              value={thickness}
              onChange={(e) => setThickness(e.target.value)}
              className={styles.input}
            />
          </div>
        </>
      )}

      <div className={styles.inputGroup}>
        <label className={styles.label}>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Rate (per kg):</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={styles.input}
        />
      </div>

      <button onClick={calculate} className={styles.button}>
        Calculate
      </button>

      {result && (
        <div className={styles.resultBox}>
          <div>
            <strong>Total Weight:</strong> {result.totalWeight} kg
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Total Cost:</strong> ₹{result.totalCost}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
