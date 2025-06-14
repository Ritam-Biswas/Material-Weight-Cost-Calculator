import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const fetchAllMaterials = async () => {
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

  return data;
};
