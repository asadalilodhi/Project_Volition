import { Link, useLocation } from 'react-router';
import { Search, RotateCw, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'VOID' },
    { path: '/calendar', label: 'TASKS' },
    { path: '/document', label: 'ARCHIVE' },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-14 border-b border-[#222] bg-[#000]/60 backdrop-blur-xl"
      style={{
        boxShadow: '0 4px 32px 0 rgba(0, 0, 0, 0.5), inset 0 -1px 0 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-center gap-12">
        <Link to="/" className="text-white font-['Syncopate'] font-bold text-sm tracking-widest flex items-center gap-2">
          KNOWLEDGE_VOID
        </Link>
        <div className="flex items-center gap-6 text-xs">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-1 transition-colors ${
                  isActive ? 'text-white' : 'text-[#666] hover:text-[#aaa]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-[19px] left-0 w-full h-[2px] bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-[#111] px-3 py-1.5 border border-[#333]">
          <Search size={14} className="text-[#666]" />
          <input 
            type="text" 
            placeholder="COMMAND_INPUT" 
            className="bg-transparent text-xs text-white placeholder:text-[#666] outline-none w-48 font-['Share_Tech_Mono']"
          />
        </div>
        <div className="flex items-center gap-3 text-[#666]">
          <button className="hover:text-white transition-colors">
            <RotateCw size={16} />
          </button>
          <button className="hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
