import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        router.replace('/auth/login?error=Authentication failed. Please try again.');
        return;
      }
      // Redirect to dashboard on success
      router.replace('/dashboard');
    };
    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-circa-green-light">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Completing authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
} 