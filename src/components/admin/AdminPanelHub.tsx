import React, { useState } from 'react';
import { AdminRouteGuard } from './AdminRouteGuard';
import { AdminLayout } from './AdminLayout';
import { DashboardModule } from './modules/DashboardModule';
import { UsersModule } from './modules/UsersModule';
import { AnnouncementsModule } from './modules/AnnouncementsModule';
import { SettingsModule } from './modules/SettingsModule';
import { BundlesModule } from './modules/BundlesModule';
import { PromoTopupModule } from './modules/PromoTopupModule';
import { ApiKeysModule } from './modules/ApiKeysModule';
import { AuditLogModule } from './modules/AuditLogModule';
import { AdminModuleId } from './types';
import { Language, UserProfile } from '../../types';

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
  const [currentModule, setCurrentModule] = useState<AdminModuleId>('dashboard');

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
        {currentModule === 'dashboard' && (
          <DashboardModule language={language} onNavigate={(mod) => setCurrentModule(mod)} />
        )}
        {currentModule === 'users' && <UsersModule language={language} />}
        {currentModule === 'announcements' && <AnnouncementsModule language={language} />}
        {currentModule === 'settings' && <SettingsModule language={language} initialTab="socials" />}
        {currentModule === 'flags' && <SettingsModule language={language} initialTab="flags" />}
        {currentModule === 'credits' && <SettingsModule language={language} initialTab="credits" />}
        {currentModule === 'bundles' && <BundlesModule language={language} />}
        {currentModule === 'promo_topup' && <PromoTopupModule language={language} />}
        {currentModule === 'providers' && <ApiKeysModule language={language} />}
        {currentModule === 'audit' && <AuditLogModule language={language} />}
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default AdminPanelHub;
