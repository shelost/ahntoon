import type { LayoutLoad, LayoutLoadEvent } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
// @ts-ignore
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async (event: LayoutLoadEvent) => {
  const { url } = event;
  const { pathname } = url;

  // Your existing code to check for session and redirect if not authenticated
  const { session } = await getSupabase(event);
  if (!session) {
    throw redirect(303, '/auth');
  }

  // Your existing code to get user data and return it
  return {
    user: session.user,
    pathname
  };
};
