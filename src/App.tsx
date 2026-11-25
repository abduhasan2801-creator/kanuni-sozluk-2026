import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.tsx';
import { AppPreferencesProvider } from './context/AppPreferencesContext.tsx';
import { AIAssistantPage } from './pages/AIAssistantPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { DistinctionsPage } from './pages/DistinctionsPage.tsx';
import { DocumentTranslatorPage } from './pages/DocumentTranslatorPage.tsx';
import { FavoritesPage } from './pages/FavoritesPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LegislationPage } from './pages/LegislationPage.tsx';
import { QuizPage } from './pages/QuizPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { TermDetailPage } from './pages/TermDetailPage.tsx';

export default function App() {
  return (
    <AppPreferencesProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/term/:id" element={<TermDetailPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/distinctions" element={<DistinctionsPage />} />
            <Route path="/legislation" element={<LegislationPage />} />
            <Route path="/document-translator" element={<DocumentTranslatorPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </AppPreferencesProvider>
  );
}
