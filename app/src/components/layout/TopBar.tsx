export function TopBar() {
  return (
    <div className="bg-[#003366] text-white py-1 px-4 text-xs">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <a href="#" className="hover:text-[#ff9900]">Grey Scale</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-[#ff9900]">Light Mode</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-[#ff9900]">Intranet</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-[#ff9900]">eOffice</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-[#ff9900]">Webmail</a>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-[#ff9900]">Directory</a>
          <span className="text-gray-400">|</span>
          <a href="#" className="hover:text-[#ff9900]">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
