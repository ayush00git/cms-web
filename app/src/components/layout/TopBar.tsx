export function TopBar() {
  return (
    <div className="bg-[#222222] border-b border-[#333333] py-1.5 px-4 text-xs text-[#999999]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-white transition-colors">Intranet</a>
          <span className="text-[#444444]">|</span>
          <a href="#" className="hover:text-white transition-colors">eOffice</a>
          <span className="text-[#444444]">|</span>
          <a href="#" className="hover:text-white transition-colors">Webmail</a>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-white transition-colors">Directory</a>
          <span className="text-[#444444]">|</span>
          <a href="#" className="hover:text-white transition-colors">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
