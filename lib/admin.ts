import { getOrCreateUser } from './user';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const adminEmail = process.env.ADMIN_EMAIL ?? '';
  if (user.email !== adminEmail) redirect('/dashboard');

  return user;
}
