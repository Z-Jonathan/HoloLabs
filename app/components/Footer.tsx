const links = ["Privacy", "Terms", "Contact", "X", "Instagram"];

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-content px-6 pb-12 pt-8">
      <div className="glass-surface glass-specular relative overflow-hidden rounded-glass-lg px-6 py-8 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="text-lg font-semibold text-gradient">Holo</span>
            <p className="mt-1 text-sm text-ink-soft">
              Holo — conversations without barriers.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              {links.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="rounded-md transition-colors hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 text-xs text-ink-mute">
          © {new Date().getFullYear()} Holo. Built with and for the Deaf
          community.
        </p>
      </div>
    </footer>
  );
}
