import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-nith-primary text-light py-5 border-top border-4 border-nith-accent mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <h3 className="text-white fw-bold fs-5 mb-4">NIT Hamirpur</h3>
            <p className="small lh-lg mb-4 text-white-50">
              National Institute of Technology Hamirpur is a public technical university located in Hamirpur, Himachal Pradesh, India.
              The Estate Office is responsible for the overall maintenance of the campus.
            </p>
          </div>
          <div className="col-12 col-md-6">
            <h3 className="text-white fw-bold fs-5 mb-4">Contact Us</h3>
            <ul className="list-unstyled small text-white-50">
              <li className="d-flex align-items-start mb-3">
                <MapPin className="me-2 text-nith-accent flex-shrink-0" />
                <span>National Institute of Technology, Anu, Hamirpur, Himachal Pradesh 177005</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <Phone className="me-2 text-nith-accent flex-shrink-0" />
                <span>+91-1972-254011</span>
              </li>
              <li className="d-flex align-items-center mb-3">
                <Mail className="me-2 text-nith-accent flex-shrink-0" />
                <span>registrar@nith.ac.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mt-5 pt-4 border-top border-secondary small text-center text-white-50">
        <p className="mb-0">&copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
