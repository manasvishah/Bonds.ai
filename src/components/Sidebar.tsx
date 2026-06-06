import React from 'react';
import { Search, Plus, MessageSquare, Filter, Settings, User, Heart, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ConversationSession } from '../types';
import { APP_THEME } from '../constants';

interface SidebarProps {
  sessions: ConversationSession[];
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onOpenSettings: () => void;
  activeSessionId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ sessions, onSelectSession, onNewSession, onOpenSettings, activeSessionId, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={`${isCollapsed ? 'w-[68px]' : 'w-64'} border-r border-stone-200/60 flex flex-col h-full bg-[#FAF9F7] select-none transition-all duration-300 ease-in-out relative`}>
      <div className={`p-4 h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <Heart className="text-vermilion fill-vermilion shrink-0" size={18} />
          {!isCollapsed && (
            <h1 className="font-bold tracking-tight text-charcoal text-[18px] truncate">Bonds.ai</h1>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-stone-200/50 text-stone-400 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
        {isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="absolute -right-3 top-6 p-1 bg-white border border-stone-200 rounded-full text-stone-400 hover:text-charcoal z-50 hover:scale-110 transition-all"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={14} />
          </button>
        )}
      </div>

      <div className={`px-4 mb-8 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={onNewSession}
          className={`group flex items-center justify-center gap-2 bg-white ${isCollapsed ? 'h-10 w-10 p-0' : 'w-full px-4 py-2.5'} text-[12px] font-bold ring-1 ring-stone-200 transition-all hover:bg-stone-50 active:scale-95 text-charcoal rounded-full uppercase tracking-widest`}
          title={isCollapsed ? "New Reflection" : ""}
        >
          <Plus size={14} className="text-stone-400 group-hover:text-vermilion transition-colors" />
          {!isCollapsed && <span>New Reflection</span>}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search history..."
              className="w-full rounded-lg bg-stone-100 px-3 py-2 text-[12px] focus:outline-none focus:ring-1 focus:ring-stone-200 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>
      )}
      
      {isCollapsed && (
        <div className="flex flex-col items-center gap-6 mb-4">
          <button className="p-2 text-stone-400 hover:text-stone-600 transition-colors" title="Search">
            <Search size={18} />
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto px-4 ${isCollapsed ? 'scrollbar-hide' : ''}`}>
        {!isCollapsed && (
          <div className="pb-3 text-[11px] font-bold uppercase tracking-widest text-stone-400">Recent</div>
        )}
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left transition-all group border ${
                isCollapsed ? 'p-2 rounded-xl' : 'p-4 rounded-xl'
              } ${
                activeSessionId === session.id
                  ? 'bg-white border-stone-200'
                  : 'bg-transparent border-transparent hover:bg-white hover:border-stone-200/50'
              }`}
            >
              {isCollapsed ? (
                <div className="flex justify-center relative">
                  <MessageSquare size={18} className={activeSessionId === session.id ? 'text-stone-400' : 'text-stone-300'} />
                  {activeSessionId === session.id && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-stone-300 rounded-full" />
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300 group-hover:text-stone-400 transition-colors uppercase tracking-[0.1em]">{session.date}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">
                      {session.agentResponses.length} agents
                    </span>
                  </div>
                  <p className={`line-clamp-2 text-[14px] leading-snug transition-colors ${activeSessionId === session.id ? 'text-charcoal font-bold pr-4' : 'text-stone-500 font-medium'}`}>
                    {session.userInput || 'New Reflection'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {session.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">#{tag}</span>
                    ))}
                    {(!session.tags || session.tags.length === 0) && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">#{session.relationshipType}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-auto border-t border-stone-200/60 ${isCollapsed ? 'py-4 flex flex-col items-center' : ''}`}>
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-4 px-6'} hover:bg-stone-50 transition-colors group`}
          title={isCollapsed ? "Settings" : ""}
        >
          <div className={`rounded-full bg-stone-200 flex items-center justify-center text-stone-400 shrink-0 ${isCollapsed ? 'h-10 w-10' : 'h-8 w-8'}`}>
            <User size={16} />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left overflow-hidden">
                <p className="truncate text-[13px] font-bold text-charcoal">Alex Rivera</p>
                <p className="text-[11px] text-warm-gray">Settings & Profile</p>
              </div>
              <Settings size={16} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
