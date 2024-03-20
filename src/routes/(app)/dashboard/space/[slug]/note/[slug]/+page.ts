import { supabaseClient } from "$lib/db";
import { page } from '$app/stores';


export async function load({ page, params }) {

	try {

        const { data: note, error } = await supabaseClient
                .from('notes')
                .select('*')
                .eq('id', params.slug)
                .single();


        return note

	} catch (error) {
		throw Error(`Could not find space with id ${params.slug}`)
	}
}

