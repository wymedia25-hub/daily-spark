import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import LanguageProvider from './components/LanguageProvider';
import { useDarkMode } from './lib/useDarkMode';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Wallpapers from './pages/Wallpapers';
import Theme from './pages/Theme';
import SavedQuotes from './pages/SavedQuotes';
import QuoteDetail from './pages/QuoteDetail';
import MyQuotes from './pages/MyQuotes';
import Paywall from './pages/Paywall';
import Reminders from './pages/Reminders';
import AdminImport from './pages/AdminImport';
import SourceDetail from './pages/SourceDetail';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/wallpapers" element={<Wallpapers />} />
        <Route path="/theme" element={<Theme />} />
        <Route path="/saved-quotes" element={<SavedQuotes />} />
        <Route path="/quote/:id" element={<QuoteDetail />} />
        <Route path="/my-quotes" element={<MyQuotes />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/admin/import" element={<AdminImport />} />
        <Route path="/source/:id" element={<SourceDetail />} />
      </Route>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useDarkMode();
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <LanguageProvider>
            <AuthenticatedApp />
          </LanguageProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App