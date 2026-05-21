export function TopBar() {
  return (
    <div className="bg-nith-primary text-white py-1 px-3 small">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3">
          <a href="#" className="text-white text-decoration-none">Grey Scale</a>
          <span className="text-white-50">|</span>
          <a href="#" className="text-white text-decoration-none">Light Mode</a>
          <span className="text-white-50">|</span>
          <a href="#" className="text-white text-decoration-none">Intranet</a>
          <span className="text-white-50">|</span>
          <a href="#" className="text-white text-decoration-none">eOffice</a>
          <span className="text-white-50">|</span>
          <a href="#" className="text-white text-decoration-none">Webmail</a>
        </div>
        <div className="d-flex gap-3">
          <a href="#" className="text-white text-decoration-none">Directory</a>
          <span className="text-white-50">|</span>
          <a href="#" className="text-white text-decoration-none">Contact Us</a>
        </div>
      </div>
    </div>
  );
}
