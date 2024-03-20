<script lang="ts">
    import type { PageData } from './$types';
    import { supabaseClient } from '$lib/db';
    import { onMount } from 'svelte';

    export let data: PageData;
    let { profile } = data;

    // Function to update user profile data in the database
    async function updateProfile() {
        try {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    username: profile.username
                })
                .eq('id', profile.id);

            if (!error) {
                console.log('Profile updated successfully!');
            } else {
                console.error('Error updating profile:', error);
            }
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    }

    onMount(() => {
        // Fetch user profile data or perform any other necessary operations
    });
</script>

<div class="card max-w-3xl mx-auto">
    <form on:submit|preventDefault="{updateProfile}" class="flex flex-col gap-2">
        <!-- Full Name field -->
        <div class="field">
            <label for="full_name" class="label">Full Name</label>
            <p class="control">
                <input
                    id="full_name"
                    name="full_name"
                    class="input"
                    type="text"
                    bind:value="{profile.full_name}"
                    required
                />
            </p>
        </div>

        <!-- Username field -->
        <div class="field">
            <label for="username" class="label">Username</label>
            <p class="control">
                <input
                    id="username"
                    name="username"
                    class="input"
                    type="text"
                    bind:value="{profile.username}"
                    required
                />
            </p>
        </div>

        <!-- Save button -->
        <div class="mx-auto">
            <button type="submit" class="btn btn-filled-primary">Save</button>
        </div>
    </form>
</div>
