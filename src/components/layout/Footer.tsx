export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0D0D0D] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400 text-sm">
          UbuntuMeet — Secure. Private. Made for Africa.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="text-gray-500 hover:text-[#D4A017] transition-colors">Twitter</a>
          <a href="#" className="text-gray-500 hover:text-[#D4A017] transition-colors">LinkedIn</a>
          <a href="#" className="text-gray-500 hover:text-[#D4A017] transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
