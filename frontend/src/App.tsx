import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import type { PageId } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [playgroundProps, setPlaygroundProps] = useState<{
    initialCode?: string;
    puzzleId?: string;
    puzzleTitle?: string;
  }>({});

  const handleNavigate = (page: PageId, extraData?: any) => {
    if (page === 'playground' && extraData) {
      setPlaygroundProps(extraData);
    }
    setCurrentPage(page);
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'playground' && (
        <PlaygroundPage 
          initialCode={playgroundProps.initialCode}
          puzzleId={playgroundProps.puzzleId}
          puzzleTitle={playgroundProps.puzzleTitle}
        />
      )}
      {currentPage === 'challenges' && <ChallengesPage />}
      {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentPage === 'profile' && <ProfilePage />}
    </AppLayout>
  );
}

export default App;
