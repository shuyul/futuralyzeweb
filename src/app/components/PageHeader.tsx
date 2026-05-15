import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  excerpt?: string;
  meta?: string;
  back?: { to: string; label: string };
  bg?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  excerpt,
  meta,
  back,
  bg = "#F5F2ED",
  children,
}: PageHeaderProps) {
  return (
    <section
      className="w-full relative border-b border-[#1A1A1A]/[0.10]"
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%), ${bg}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-14">
        {back && (
          <Link
            to={back.to}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#555] hover:text-[#1A1A1A] transition-colors mb-10"
          >
            <ArrowLeft size={13} />
            {back.label}
          </Link>
        )}
        {eyebrow && (
          <div className="text-[10px] tracking-[0.32em] uppercase text-[#C4463A] mb-5">
            {eyebrow}
          </div>
        )}
        <div className="flex items-end gap-5 mb-6">
          <h1 className="font-display text-[56px] md:text-[68px] leading-[0.95] tracking-tight text-[#1A1A1A]">
            {title}
          </h1>
          <span className="hidden md:block w-20 h-px bg-[#C4463A]/80 mb-5" />
        </div>
        {excerpt && (
          <p className="max-w-2xl text-[15px] leading-[1.85] text-[#555]">{excerpt}</p>
        )}
        {meta && (
          <div className="mt-6 text-[11px] tracking-[0.22em] uppercase text-[#999]">{meta}</div>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
