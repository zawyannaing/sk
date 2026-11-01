import React, { useState } from 'react';
import { AdminRouteGuard } from './AdminRouteGuard';
import { AdminLayout } from './AdminLayout';
import { UsersModule } from './modules/UsersModule';
import { AdminModuleId } from './types';
import { Language, UserProfile } from '../../types';
import { Sparkles, Construction } from 'lucide-react';

interface AdminPanelHubProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToApp: () => void;
  currentUser: UserProfile;
}

export const AdminPanelHub: React.FC<AdminPanelHubProps> = ({
  language,
  onLanguageChange,
  onBackToApp,
  currentUser
}) => {
  const [currentModule, setCurrentModule] = useState<AdminModuleId>('users');

  return (
    <AdminRouteGuard language={language} onBackToApp={onBackToApp}>
      <AdminLayout
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        language={language}
        onLanguageChange={onLanguageChange}
        onBackToApp={onBackToApp}
        currentUser={currentUser}
      >
        {currentModule === 'users' && <UsersModule language={language} />}

        {currentModule !== 'users' && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Construction className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white capitalize">
                {currentModule.replace('_', ' ')} Module
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                This administrative module is scheduled for implementation in the next phase of the security deployment plan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentModule('users')}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              Go to Users & Balances Module
            </button>
          </div>
        )}
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default AdminPanelHub;
