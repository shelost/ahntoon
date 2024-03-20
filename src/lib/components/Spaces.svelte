<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Space from './Space.svelte'
    import type { PageData, Task } from '../../routes/$types';
    export let data: PageData;
    $: ({ user } = data);


    export let page = false

    let showDeleteModal = false; // Control whether to show the delete modal
  let spaceToDelete = null;   // Track which space to delete


  async function deleteSpace() {


    const { data, error } = await supabaseClient.from('spaces').delete().eq('id', spaceToDelete).select()
    if (error) {
      console.error('Error deleting space:', error);
      return;
    }


    console.log(spaceToDelete)
    console.log(data, error)


    spaces.update(spaces => spaces.filter(space => space.id !== spaceToDelete));
    showDeleteModal = false;
  }

    // Create a Svelte store to hold the spaces data
    let spaces = writable([]);

    onMount(async () => {
      // Fetch spaces data from the Supabase "spaces" table when the component is mounted
      const { data: fetchedSpaces, error } = await supabaseClient
                                            .from('spaces')
                                            .select('*')
                                            .eq('user_id', user.id)
                                            .select()

      if (error) {
        console.error('Error fetching spaces:', error);
        return;
      }

      if (fetchedSpaces) {
        // Update the spaces store with the fetched data
        spaces.set(fetchedSpaces);
      }
    });

    async function newSpace() {
      const { data: d, error } = await supabaseClient
        .from('spaces')
        .upsert([
          {
            id: crypto.randomUUID(),
            title: '',
            user_id: user.id,
          },
        ])
        .select()

      // Update the notes store with the newly added note
      if (!error) {

        spaces.update((prevSpaces) => [...prevSpaces, d[0]]);
        window.location.href = `./dashboard/space/${d[0].id}`

      } else {
        console.error('Error inserting the new space:', error);
      }
    }

</script>


<style>


    #spaces{
        display: flex;
        flex-wrap: wrap;
        gap: 30px 30px;
        justify-content: flex-start;
        align-items: center;
        padding-top: 30px;
        padding-bottom: 100px !important;
    }

    #add_space{
      border: 1px solid rgba(255,255,255,0.4);
      color: white;
      width: 200px;
      height: 200px;
      border-radius: 30px;
      margin-top: -100px;
      text-align: center;

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;

      transition: 0.2s ease;
      cursor: pointer;
    }

    #add_space:hover{
      background: rgba(255,255,255,0.1);
    }


    .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border: 1px solid gray;
    border-radius: 5px;
    z-index: 10;
  }


</style>



{#if showDeleteModal}
  <div class="modal">
    <p>Are you sure you want to delete this Scrollable?</p>
    <p>This action cannot be undone.</p>
    <button on:click={deleteSpace}>Delete</button>
    <button on:click={() => showDeleteModal = false}>Never Mind</button>
  </div>
{/if}



<div id='spaces'>
    {#each $spaces as space}
    <Space
    {space}
    page={page}
    on:deleteSpace={(e) => {
        spaceToDelete = e.detail;
        showDeleteModal = true;
    }}
/>

    {/each}
    <div on:click={newSpace} id = 'add_space'>
      <h2> + </h2>
      <h1> Add Scrollable </h1>
    </div>
  </div>