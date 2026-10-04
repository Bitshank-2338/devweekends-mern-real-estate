import { useAuth } from '../context/AuthContext';
import { AgentDashboard } from '../components/dashboard/AgentDashboard';
import { BuyerDashboard } from '../components/dashboard/BuyerDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user.name.split(' ')[0];

  return (
    <div className="container page">
      <header className="page-header">
        <h1>Welcome back, {firstName}</h1>
        <p className="muted">
          {user.role === 'agent'
            ? 'Manage your listings, profile, inquiries and visits.'
            : 'Keep track of your inquiries, visits and reviews.'}
        </p>
      </header>

      {user.role === 'agent' ? <AgentDashboard /> : <BuyerDashboard user={user} />}
    </div>
  );
}
