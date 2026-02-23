import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface NavPrevNextProps {
  prev?: { label: string; href: string };
  next?: { label: string; href: string };
}

export function NavPrevNext({ prev, next }: NavPrevNextProps) {
  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#3f3f46]">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#2A8F9D] transition-colors"
        >
          <IconChevronLeft size={16} />
          <span>{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#2A8F9D] transition-colors"
        >
          <span>{next.label}</span>
          <IconChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
