import { Toaster } from 'sonner';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Investments from './pages/Investments';
import NotFound from './pages/NotFound';
import VerifyOtp from './pages/VerifyOTP';

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/auth/verify-otp" component={VerifyOtp}/>

      {/* Main Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/accounts/:id" component={AccountDetail} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/categories" component={Categories} />
      <Route path="/investments" component={Investments} />

      {/* Fallback */}
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Toaster position="top-center" />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
