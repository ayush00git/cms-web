export function TopBar() {
  return (
    <div className="bg-nith-primary text-white py-1 px-4 text-xs md:text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex flex-wrap justify-center gap-3">
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Grey Scale</a>
          <span className="text-white/50">|</span>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Light Mode</a>
          <span className="text-white/50">|</span>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Intranet</a>
          <span className="text-white/50">|</span>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">eOffice</a>
          <span className="text-white/50">|</span>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Webmail</a>
        </div>
        <div className="flex gap-3">
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Directory</a>
          <span className="text-white/50">|</span>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
