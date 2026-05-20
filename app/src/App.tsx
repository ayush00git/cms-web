import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { FacultySignup } from './pages/auth/FacultySignup';
import { WardenSignup } from './pages/auth/WardenSignup';
import { CentreHeadSignup } from './pages/auth/CentreHeadSignup';
import { FacultyLogin } from './pages/auth/FacultyLogin';
import { WardenLogin } from './pages/auth/WardenLogin';
import { CentreHeadLogin } from './pages/auth/CentreHeadLogin';
import { StaffLogin } from './pages/auth/StaffLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup/faculty" element={<FacultySignup />} />
        <Route path="/signup/warden" element={<WardenSignup />} />
        <Route path="/signup/centre-head" element={<CentreHeadSignup />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path="/login/warden" element={<WardenLogin />} />
        <Route path="/login/centre-head" element={<CentreHeadLogin />} />
        <Route path="/login/staff" element={<StaffLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
