// 'use client';
// import { useAuth } from '@/contexts/AuthContext';
import { prisma } from '@workspace/database';
export default async function Dashboard() {
  // const { user, loading } = useAuth();
  const users = await prisma.user.findMany();

  console.log(users);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!user) {
  //   return <div>Unauthorized</div>;
  // }
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
