import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Menu, X, Settings } from "lucide-react";
import { Logo } from "./Logo";

const navigation = [
  { name: "博客", href: "/blog", en: "Journal" },
  { name: "Agents", href: "/agents", en: "Agents" },
  { name: "图册", href: "/gallery", en: "Gallery" },
  { name: "资料库", href: "/resources", en: "Library" },
  { name: "热点", href: "/trending", en: "Signals" },
];

const GLOBAL_STYLES = `
  body { background: #F5F2ED; color: #1A1A1A; }
  .font-display {
    font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .font-body {
    font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
  }
  .accent-link {
    position: relative;
    transition: color 0.25s ease;
  }
  .accent-link::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: -4px;
    height: 1px;
    background: #C4463A;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .accent-link:hover { color: #1A1A1A; }
  .accent-link:hover::after { transform: scaleX(1); }
  .hairline-card {
    background: #FFFFFF;
    border: 1px solid rgba(26,26,26,0.10);
    border-radius: 2px;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  }
  .hairline-card:hover {
    border-color: rgba(26,26,26,0.28);
    box-shadow: 0 14px 40px -22px rgba(40,30,15,0.35);
  }
  .chip {
    display: inline-flex; align-items: center;
    padding: 2px 8px;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(26,26,26,0.75);
    border: 1px solid rgba(26,26,26,0.18);
    border-radius: 2px;
  }
  .chip-red {
    color: #C4463A;
    border-color: rgba(196,70,58,0.45);
  }
  .filter-pill {
    padding: 7px 16px;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #555;
    border: 1px solid rgba(26,26,26,0.14);
    border-radius: 2px;
    background: transparent;
    transition: all 0.2s ease;
  }
  .filter-pill:hover { color: #1A1A1A; border-color: rgba(26,26,26,0.35); }
  .filter-pill[data-active="true"] {
    background: #1A1A1A;
    color: #F8F6F2;
    border-color: #1A1A1A;
  }
  .magazine-prose h2 {
    font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
    font-size: 28px;
    line-height: 1.25;
    color: #1A1A1A;
    margin: 3rem 0 1rem;
    font-weight: 700;
  }
  .magazine-prose h3 {
    font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
    font-size: 22px;
    line-height: 1.3;
    color: #1A1A1A;
    margin: 2rem 0 0.75rem;
    font-weight: 700;
  }
  .magazine-prose p {
    font-size: 16px;
    line-height: 1.95;
    color: #2A2A2A;
    margin-bottom: 1.4rem;
  }
  .magazine-prose ul, .magazine-prose ol {
    color: #2A2A2A;
    font-size: 16px;
    line-height: 1.85;
    margin: 0 0 1.4rem 1.25rem;
    padding-left: 0.5rem;
  }
  .magazine-prose ul li { list-style: disc; margin-bottom: 0.4rem; }
  .magazine-prose ol li { list-style: decimal; margin-bottom: 0.4rem; }
  .magazine-prose a { color: #C4463A; text-decoration: underline; text-underline-offset: 4px; }
  .magazine-prose strong { color: #1A1A1A; }
  .magazine-prose code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    background: rgba(26,26,26,0.06);
    padding: 1px 6px;
    border-radius: 2px;
  }
  .magazine-prose blockquote {
    border-left: 2px solid #C4463A;
    padding: 4px 0 4px 20px;
    color: #444;
    font-style: italic;
    margin: 1.5rem 0;
  }
`;

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };
  const isAdmin = location.pathname === "/admin";

  return (
    <div className="min-h-screen font-body text-[#1A1A1A]" style={{ background: "#F5F2ED" }}>
      <style>{GLOBAL_STYLES}</style>

      <div className="fixed inset-0 -z-10" style={{ background: "#F5F2ED" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[#1A1A1A]/[0.10]"
        style={{ background: "rgba(245,242,237,0.82)" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-4 group">
              <Logo size={22} />
              <span className="hidden sm:inline text-[10px] tracking-[0.32em] uppercase text-[#999] border-l border-[#1A1A1A]/15 pl-4">
                Journal · Tools · Signals
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-[12px] tracking-[0.22em] uppercase accent-link ${
                    isActive(item.href) ? "text-[#1A1A1A]" : "text-[#555]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/admin"
                className={`p-1.5 rounded-sm transition-colors ${
                  isAdmin ? "text-[#C4463A]" : "text-[#999] hover:text-[#1A1A1A]"
                }`}
                title="管理后台"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </nav>

            <button
              className="md:hidden p-2 text-[#1A1A1A]"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-[#1A1A1A]/[0.10]"
            style={{ background: "rgba(245,242,237,0.96)" }}>
            <div className="px-6 py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-[13px] tracking-[0.22em] uppercase ${
                    isActive(item.href) ? "text-[#1A1A1A]" : "text-[#555]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="block text-[13px] tracking-[0.22em] uppercase text-[#555]"
              >
                Admin
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t border-[#1A1A1A]/[0.10] mt-24"
        style={{ background: "#F0EDE7" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <div className="mb-6">
                <Logo size={38} />
              </div>
              <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-5">
                A Personal Journal of AI · Organization · Talent
              </div>
              <p className="text-[14px] leading-[1.85] text-[#555] max-w-md">
                探索未来，分析现在。一个关于技术、AI、组织演化与个人成长的个人编辑部。
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="text-[10px] tracking-[0.32em] uppercase text-[#999] mb-4">Sections</div>
              <ul className="space-y-2.5">
                {navigation.slice(0, 3).map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="text-[13px] text-[#1A1A1A] accent-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-4">
              <div className="text-[10px] tracking-[0.32em] uppercase text-[#999] mb-4">More</div>
              <ul className="space-y-2.5">
                {navigation.slice(3).map((item) => (
                  <li key={item.href}>
                    <Link to={item.href} className="text-[13px] text-[#1A1A1A] accent-link">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-[#1A1A1A]/[0.10] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#999]">
            <div>© {new Date().getFullYear()} Futuralyze · All rights reserved</div>
            <div>Vol. {new Date().getFullYear() - 2025} · Issue {new Date().getMonth() + 1}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
