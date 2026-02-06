'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  MoreVertical,
  Plus,
  Trash2,
  Info,
  MessageSquare,
  BookOpen,
  PanelRight,
} from 'lucide-react';

interface HeaderProps {
  onNewChat?: () => void;
  onClearContext?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  showChatControls?: boolean;
}

export function Header({
  onNewChat,
  onClearContext,
  onToggleSidebar,
  sidebarOpen = false,
  showChatControls = true,
}: HeaderProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/base-conhecimento', label: 'Base de Conhecimento', icon: BookOpen },
  ];

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/teki.png" alt="Teki" width={40} height={40} className="h-10 w-10" />
            <h1 className="hidden sm:block text-sm font-semibold">Teki</h1>
          </Link>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                  >
                    <item.icon size={16} />
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {showChatControls && (
            <>
              {onToggleSidebar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={sidebarOpen ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={onToggleSidebar}
                    >
                      <PanelRight size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sidebarOpen ? 'Fechar painel' : 'Abrir painel'}
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showChatControls && (
                <>
                  <DropdownMenuItem onClick={onNewChat}>
                    <Plus size={14} className="mr-2" />
                    Novo atendimento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onClearContext}>
                    <Trash2 size={14} className="mr-2" />
                    Limpar contexto
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setAboutOpen(true)}>
                <Info size={14} className="mr-2" />
                Sobre o Teki
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <Image src="/teki.png" alt="Teki" width={48} height={48} className="h-12 w-12" />
                <div>
                  <DialogTitle className="text-lg">Teki</DialogTitle>
                  <DialogDescription className="text-xs">
                    Assistente inteligente para suporte tecnico
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tecnica</span>
                <Badge variant="outline">RAG</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base de conhecimento</span>
                <span className="text-xs text-muted-foreground">documentacoes, tickets, sistemas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Modelo</span>
                <Badge variant="outline">Gemini 2.5 Flash</Badge>
              </div>
            </div>

            <Separator />

            <p className="text-xs text-muted-foreground text-center">
              Ferramenta autonoma de suporte tecnico com IA
            </p>
          </DialogContent>
        </Dialog>
      </header>
    </TooltipProvider>
  );
}
