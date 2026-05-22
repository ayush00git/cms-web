import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-nith-primary text-white py-10 border-t-4 border-nith-accent mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">NIT Hamirpur</h3>
            <p className="text-sm leading-loose mb-4 text-white/70">
              National Institute of Technology Hamirpur is a public technical university located in Hamirpur, Himachal Pradesh, India.
              The Estate Office is responsible for the overall maintenance of the campus.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="list-none text-sm text-white/70 space-y-3 p-0 m-0">
              <li className="flex items-start">
                <MapPin className="mr-2 text-nith-accent shrink-0" size={20} />
                <span>National Institute of Technology, Anu, Hamirpur, Himachal Pradesh 177005</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 text-nith-accent shrink-0" size={20} />
                <span>+91-1972-254011</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 text-nith-accent shrink-0" size={20} />
                <span>registrar@nith.ac.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-10 pt-6 border-t border-white/20 text-sm text-center text-white/70">
        <p className="mb-0">&copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
