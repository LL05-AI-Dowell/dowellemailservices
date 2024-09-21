import { Route, Routes } from 'react-router-dom';
import Healthcheck from './Pages/ServerHealthStatus/ServerHealthStatus'
import LoginPage from './Pages/Login/Login';
import HomePage from './Pages/Home/HomePage';

const App = () => {
  return (
    <Routes>
      <Route path="/server-check" element={<Healthcheck />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  );
};

export default App;