import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-auto">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-bold text-base mb-3">NIT Hamirpur</h3>
          <p className="text-sm text-[#999999] leading-relaxed">
            National Institute of Technology Hamirpur is a public technical university in Himachal Pradesh.
            The Estate Office oversees campus maintenance and infrastructure.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Quick Links</h3>
          <ul className="text-sm text-[#999999] space-y-2">
            <li><a href="#" className="hover:text-white transition-colors">Lodge a Complaint</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Track Complaint Status</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Filing Guidelines</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Staff Portal</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Contact Us</h3>
          <ul className="text-sm text-[#999999] space-y-3">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#666666]" />
              <span>NIT Hamirpur, Anu, Hamirpur, Himachal Pradesh 177005</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 shrink-0 text-[#666666]" />
              <span>+91-1972-254011</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0 text-[#666666]" />
              <span>registrar@nith.ac.in</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#222222] py-4 text-center text-xs text-[#555555]">
        &copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.
      </div>
    </footer>
  );
}
