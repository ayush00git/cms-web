import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1e1e1e] text-gray-300 py-5 border-t-4 border-[#ff9900] mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">NIT Hamirpur</h3>
          <p className="text-sm leading-relaxed mb-4">
            National Institute of Technology Hamirpur is a public technical university located in Hamirpur, Himachal Pradesh, India.
            The Estate Office is responsible for the overall maintenance of the campus.
          </p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
          <ul className="text-sm space-y-3">
            <li className="flex items-start">
              <MapPin className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
              <span>National Institute of Technology, Anu, Hamirpur, Himachal Pradesh 177005</span>
            </li>
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
              <span>+91-1972-254011</span>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
              <span>registrar@nith.ac.in</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-gray-700 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
