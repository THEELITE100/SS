function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="12.5" stroke="#EAF0FE" strokeWidth="1.5" />
                <circle cx="14" cy="14" r="7" stroke="#EAF0FE" strokeWidth="1.5" strokeDasharray="2 2.5" />
                <circle cx="14" cy="3.5" r="2" fill="#EAF0FE" />
              </svg>
              <span className="font-display text-base font-medium text-paper">SkillSphere</span>
            </div>
            <p className="mt-3 text-sm text-graphite-dark">
              Hyperlocal freelancing, matched by skill and backed by escrow.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-paper">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-graphite-dark">
              <li>How it works</li>
              <li>Categories</li>
              <li>Trust &amp; safety</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-paper">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-graphite-dark">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-paper">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-graphite-dark">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-ink-line pt-6 text-xs text-graphite-dark">
          © {new Date().getFullYear()} SkillSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
