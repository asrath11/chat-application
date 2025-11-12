'use client';
import { useAuth } from '@/contexts/AuthContext';
export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Unauthorized</div>;
  }
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
