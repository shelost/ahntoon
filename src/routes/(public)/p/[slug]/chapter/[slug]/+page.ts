import { supabaseClient } from "$lib/db";

export async function load({ params }) {

	try {
        const { data: space, error } = await supabaseClient
        .from('chapters')
        .select('*')
        .eq('n', params.slug)
         .single();

        return space

	} catch (e) {
		throw Error(`Could not find chapter with id ${space.slug}`)
	}
}