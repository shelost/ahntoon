import { supabaseClient } from "$lib/db";

export async function load({ params }) {

	try {
        const { data: canvas, error } = await supabaseClient
        .from('canvas')
        .select('*')
        .eq('id', params.slug)
        .single();

        return canvas

	} catch (e) {
		throw Error(`Could not find space with id ${params.slug}`)
	}
}

