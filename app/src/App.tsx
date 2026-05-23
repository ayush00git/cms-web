import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { FacultySignup } from './pages/auth/FacultySignup';
import { WardenSignup } from './pages/auth/WardenSignup';
import { CentreHeadSignup } from './pages/auth/CentreHeadSignup';
import { FacultyLogin } from './pages/auth/FacultyLogin';
import { WardenLogin } from './pages/auth/WardenLogin';
import { CentreHeadLogin } from './pages/auth/CentreHeadLogin';
import { StaffLogin } from './pages/auth/StaffLogin';
import { VerifyAccount } from './pages/auth/VerifyAccount';
import { FacultyPost } from './pages/post/FacultyPost';
import { WardenPost } from './pages/post/WardenPost';
import { CentreHeadPost } from './pages/post/CentreHeadPost';
import { Profile } from './pages/profile/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/faculty/signup" element={<FacultySignup />} />
        <Route path="/warden/signup" element={<WardenSignup />} />
        <Route path="/centre-head/signup" element={<CentreHeadSignup />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/warden/login" element={<WardenLogin />} />
        <Route path="/centre-head/login" element={<CentreHeadLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/faculty/post" element={<FacultyPost />} />
        <Route path="/warden/post" element={<WardenPost />} />
        <Route path="/centre-head/post" element={<CentreHeadPost />} />
        <Route path="/account/verify" element={<VerifyAccount />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
