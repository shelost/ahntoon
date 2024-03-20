import { supabaseClient } from "$lib/db";

export async function load({ params }) {

	try {
        const { data: space, error } = await supabaseClient
        .from('series')
        .select('*')
        .eq('slug', params.slug)
         .single();

        return space

	} catch (e) {
		throw Error(`Could not find space with id ${space.slug}`)
	}
}

