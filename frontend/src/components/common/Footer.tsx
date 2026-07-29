export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto border-t relative z-10" style={{ borderColor: 'rgba(0, 87, 168, 0.08)', background: 'linear-gradient(to right, rgba(255,255,255,0.75), rgba(247, 249, 252, 0.95))' }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
        <div className="text-center md:text-left">
          <span style={{ color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} Sri Eshwar College of Engineering. All rights reserved.</span>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <p className="tracking-widest text-[9px] uppercase font-black" style={{ color: 'var(--primary)' }}>Design & Developed by</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-2 gap-y-0.5 text-xs">
            <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>R.Giridharan, AP/CSE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>K.Bharath, CSE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>M.Karthick Raja, AP/CSE</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>Team CSE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
