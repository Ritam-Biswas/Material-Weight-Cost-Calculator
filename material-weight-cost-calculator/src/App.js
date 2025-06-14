import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import AddMaterial from './pages/AddMaterial/AddMaterial';
import EditMaterial from './pages/EditMaterials/EditMaterials';
import AllMaterials from './pages/AllMaterials/AllMaterials';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddMaterial />} />
        <Route path="/edit" element={<EditMaterial />} />
        <Route path="*" element={<p>404 Not Found</p>} />
        <Route path="/materials" element={<AllMaterials />} />
      </Routes>
    </Router>
  );
}

export default App;
