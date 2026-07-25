import { type ReactNode, useEffect } from 'react';
import {
  BriefcaseBusiness,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react';

export type PageId = 'experience' | 'project';

interface BrandHeaderProps {
  action: ReactNode;
  currentPage: PageId;
}

const PAGE_TITLES: Record<PageId, string> = {
  experience: 'Experience | Bulletify',
  project: 'Project | Bulletify',
};

const NAV_ITEMS = [
  {
    id: 'experience',
    href: '/experience',
    label: 'Experience',
    Icon: BriefcaseBusiness,
  },
  { id: 'project', href: '/project', label: 'Project', Icon: FolderKanban },
] satisfies Array<{
  id: PageId;
  href: string;
  label: string;
  Icon: LucideIcon;
}>;

export default function BrandHeader({ action, currentPage }: BrandHeaderProps) {
  useEffect(() => {
    document.title = PAGE_TITLES[currentPage];
  }, [currentPage]);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <a className="brand" href="/experience" aria-label="Bulletify experience">
          <span className="brand-mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span className="brand-name">Bulletify</span>
        </a>

        <div className="header-action">{action}</div>
      </div>

      <nav className="primary-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ id, href, label, Icon }) => {
          const isCurrent = currentPage === id;

          return (
            <a
              key={id}
              className={`nav-link${isCurrent ? ' nav-link-active' : ''}`}
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
    </header>
  );
}
