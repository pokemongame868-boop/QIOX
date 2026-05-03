// components/layout/HeaderWrapper.tsx — Server Component
// Fetches auth state and passes to Header
import { getProfile } from '@/lib/actions/auth';
import { getCartCount } from '@/lib/actions/cart';
import Header from './Header';

export default async function HeaderWrapper() {
  const [profile, cartCount] = await Promise.all([
    getProfile().catch(() => null),
    getCartCount().catch(() => 0),
  ]);
  return <Header profile={profile} cartCount={cartCount} />;
}
