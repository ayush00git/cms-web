import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { FacultySignup } from './pages/auth/FacultySignup';
import { WardenSignup } from './pages/auth/WardenSignup';
import { CentreHeadSignup } from './pages/auth/CentreHeadSignup';
import { FacultyLogin } from './pages/auth/FacultyLogin';
import { WardenLogin } from './pages/auth/WardenLogin';
import { CentreHeadLogin } from './pages/auth/CentreHeadLogin';
import { FacultyForgotPassword } from './pages/auth/FacultyForgotPassword';
import { WardenForgotPassword } from './pages/auth/WardenForgotPassword';
import { CentreHeadForgotPassword } from './pages/auth/CentreHeadForgotPassword';
import { AccountResetPass } from './pages/auth/AccountResetPass';
import { StaffLogin } from './pages/auth/StaffLogin';
import { VerifyAccount } from './pages/auth/VerifyAccount';
import { FacultyPost } from './pages/post/FacultyPost';
import { WardenPost } from './pages/post/WardenPost';
import { CentreHeadPost } from './pages/post/CentreHeadPost';
import { PostView } from './pages/post/PostView';
import { Profile } from './pages/profile/Profile';
import { XENPostView } from './pages/admin/XENPostView';
import { AEPostView } from './pages/admin/AEPostView';
import { JEPostView } from './pages/admin/JEPostView';
import { AdminPostView } from './pages/admin/AdminPostView';

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
        <Route path="/faculty/forgot-password" element={<FacultyForgotPassword />} />
        <Route path="/warden/forgot-password" element={<WardenForgotPassword />} />
        <Route path="/centre-head/forgot-password" element={<CentreHeadForgotPassword />} />
        <Route path="/account/reset-password" element={<AccountResetPass />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/faculty/post" element={<FacultyPost />} />
        <Route path="/warden/post" element={<WardenPost />} />
        <Route path="/centre-head/post" element={<CentreHeadPost />} />
        <Route path="/post/:role/:post_id" element={<PostView />} />
        <Route path="/account/verify" element={<VerifyAccount />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/xen" element={<XENPostView />} />
        <Route path="/admin/ae" element={<AEPostView />} />
        <Route path="/admin/je" element={<JEPostView />} />
        <Route path="/admin/posts/:role/:post_id" element={<AdminPostView />} />
      </Routes>
    </Router>
  );
}

export default App;
