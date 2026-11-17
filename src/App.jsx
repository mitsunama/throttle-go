import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import OfflineBanner from './components/OfflineBanner';
import About from './pages/About';
import CreateBike from './pages/CreateBike';
import EditBike from './pages/EditBike';
import Profile from './pages/Profile';
import Showroom from './pages/Showroom';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <>
      <Header />
      <OfflineBanner />
      <main>
        <Routes>
          <Route path="/" element={<Showroom />} />
          <Route path="/sell" element={<CreateBike />} />
          <Route path="/bikes/:id/edit" element={<EditBike />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<p className="container page">That page doesn’t exist.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
