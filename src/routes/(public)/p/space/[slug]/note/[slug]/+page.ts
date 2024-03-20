import { supabaseClient } from "$lib/db";

export async function load({ params }) {

	try {
        const { data: note, error } = await supabaseClient
        .from('notes')
        .select('*')
        .eq('id', params.slug)
        .single();



        return note

	} catch (e) {
		throw Error(`Could not find space with id ${params.slug}`)
	}
}

