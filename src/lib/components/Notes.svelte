<script lang="js">
     import { supabaseClient } from '$lib/db';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import Sortable from 'sortablejs'
  import UndoDialog from './UndoDialog.svelte';

  export let data;
  export let page = false;
  export let icon = null;


  let sortable;
  let order = []

  let notes = writable([]);
  let noteToEdit = { id: null, title: '', body: '' }; // Store the note to be edited
  let showUndoDialog = false;

  let notesData = []; // To store the data from the notes store

  // Subscribe to the notes store to get the data
  notes.subscribe((data) => {
    notesData = data;
  });


  async function fetchNotes() {


    const { data: d, error } = await supabaseClient
      .from('notes')
      .select('*')
      .eq('space_id', data.id)
      .order('index', { ascending: true });

    if (!error) {
      // Handle conflicts in sort_order and resolve them by giving the higher number to the note with the alphabetically foremost title
      let resolvedData = d.sort((a, b) => a.index - b.index);

      notes.set(resolvedData);
    } else {
      console.error('Error fetching notes:', error);
    }
  }

  async function updateIndices(e){

    [].forEach.call(e.from.getElementsByClassName('note'), function (el,index) {
        let id = el.id
        updateIndex(id, index)

    });
    fetchNotes()

  }

  async function updateIndex(id, index){
    const { data: d, error } = await supabaseClient
          .from('notes')
            .update({
              index: index
          })
          .eq('id', id);

        if (!error){

        }else{
          console.error('Error updating index:', error);
        }
  }


    // Fetch the notes on mount
    onMount(()=>{
      fetchNotes()

      if (!page){
        sortable = Sortable.create(document.getElementById('sortable'), {
          group: {
            name: 'sortable',
            put: true,
            pull: false,
          },
          easing: "cubic-bezier(1, 0, 0, 1)",
          dragoverBubble: false,
          removeCloneOnHide: true,
          sort: true,
          onEnd: updateIndices,
          animation: 200
        }
        );

        setTimeout(()=>{

      for (let i=0; i<sortable.el.children.length; i++){
        let note = sortable.el.children[i]
        let id = note.id
        //console.log(note.id)
      }
      }, 1000)

      }


    });

    // Function to save a note (either new or edited)
    async function saveNote() {
      if (noteToEdit.id) {
        const { data, error } = await supabaseClient
          .from('notes')
          .update({
            title: noteToEdit.title,
            body: noteToEdit.body
          })
          .eq('id', noteToEdit.id);
      } else {
        // Use database-generated UUID

        const newSortOrder = getNewSortOrder(); // Calculate the new sort_order for the new note

  const { data: k, error: q} = await supabaseClient
    .from('notes')
    .insert([
      {
        title: noteToEdit.title,
        body: noteToEdit.body,
        space_id: data.id,
        user_id: data.user_id,
        sort_order: newSortOrder, // Set the new sort_order for the new note
      },
    ])
    .select('*');



    const { data: d, error } = await supabaseClient
          .from('notes')
          .insert([
            {
              title: noteToEdit.title,
              body: noteToEdit.body,
              space_id: data.id,
              user_id: data.user_id
            }
          ])
          .select('*')

        // Update the notes store with the newly added note
        if (!error) {
          notes.update((prevNotes) => [...prevNotes, d[0]]);
        } else {
          console.error('Error inserting the new note:', error);
        }
      }
      // Clear the form after saving the note
      noteToEdit = { id: null, title: '', body: '' };

      fetchNotes()
    }

    // Function to add new note
    async function newNote() {
      const newSortOrder = getNewSortOrder(); // Calculate the new sort_order for the new note

      const { data: d, error } = await supabaseClient
        .from('notes')
        .insert([
          {
            title: '',
            body: '',
            space_id: data.id,
            user_id: data.user_id,
            index: newSortOrder, // Set the new sort_order for the new note
          },
        ])
        .select('*');

      // Update the notes store with the newly added note
      if (!error) {
        notes.update((prevNotes) => [...prevNotes, d[0]]);
        window.location.href = `./${data.id}/note/${d[0].id}`;
      } else {
        console.error('Error inserting the new note:', error);
      }
  }

  async function updateNoteOrder() {
    const sortedNotes = [...notesData].sort((a, b) => a.sort_order - b.sort_order); // Clone the notesData and sort it based on sort_order
    const notesWithNewOrder = sortedNotes.map((note, index) => ({
      ...note,
      sort_order: index + 1, // Increment the index by 1 to avoid zero-based sort_order
    }));

    // Update the notes in the store
    notes.update((prevNotes) => notesWithNewOrder);

    // Update the notes in the database
    try {
      const { error } = await supabaseClient
        .from('notes')
        .upsert(notesWithNewOrder, {
          onConflict: ['id'],
          returning: 'minimal',
        });

      if (error) {
        console.error('Error updating note order:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating note order:', error);
    }
  }

  async function deleteNote(id) {
      try {
        const { data, error } = await supabaseClient.from('notes').delete().eq('id', id);

        if (!error) {
          // Store the deleted note and show the Undo dialog
          const deletedNote = notesData.find((note) => note.id === id);
          notes.update((currNotes) => {
            return currNotes.filter((n) => n.id !== id);
          });
          showUndoDialog = true;

          // Automatically hide the Undo dialog after 5 seconds
          setTimeout(() => {
            showUndoDialog = false;
          }, 5000);
        } else {
          console.error('Error deleting note:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
  }

  function getNewSortOrder() {
    const sortedNotes = $notes.sort((a, b) => {
      // Sort by sort_order in descending order
      return b.index - a.index
    });

    // Get the maximum sort_order present in $notes
    const maxSortOrder = sortedNotes.length > 0 ? sortedNotes[0].index : -1;

    // Increment the maximum sort_order to get the new sort_order for the new note
    return maxSortOrder + 1;
  }


  function onSort(e) {
    updateNoteOrder(); // Call the updateNoteOrder function when the sort happens

    // Get the sorted elements after the sorting is done
    const sortedElements = sortable.getChildren();

    // Find the index of each sorted element in the original array of notes
    const sortedIndices = sortedElements.map((element) => {
      const noteId = element.dataset.id;
      return notesData.findIndex((note) => note.id === noteId);
    });

    // Now you have the indices of all the elements after sorting
    console.log(sortedIndices);
  }



</script>


<div class="notes">
  {#if !page}
    <button on:click={newNote}> Add Chapter </button>
  {/if}

  <div id="sortable" bind:this={sortable}>
    {#each $notes as note (note.id)}
      <div id='{note.id}' class="note">
        <a href="{data.slug}/note/{note.id}">
          <div class="note_expo">
            {#if !page}
              <div class="handle" data-sortable-handle> ☰ </div>
            {/if}
            <div class="note_icon" style='background-image:url({data.cover})'></div>
            <h1 class="note_title">{note.title}</h1>
          </div>
        </a>
        {#if !page}
          <button on:click={() => deleteNote(note.id)}>Delete</button>
        {/if}
      </div>
    {/each}
    </div>
</div>



<style>
      /* Note */


      .note_index{
        width: 10px;
      }


      button{
        width: 100%;
      }

      input{
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 10px;
      }

      textarea{
        border: none;
        padding: 0;
        font-size: 14px;
        letter-spacing: -0.2px;
        line-height: 140%;
        width: 100%;
        min-height: 100px;
      }

      .note_expo{
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .notes{
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 50px;
      }

      .note{
        width: 100%;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        color: black !important;
        padding: 20px;
        padding-left: 25px;
        transform: none;
        transition: 0.2s ease;
        margin-bottom: 20px;
        gap: 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
      }

      .note_icon{
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        background-size: cover;
        background-position: center center;
        border-radius: 5px;
        margin-right: 5px;
      }

      .note button{
        width: fit-content;
      }

      .note:hover{
        background: rgba(0,0,0,0.1);
        transform: none;
      }

      .note_title{
          font-size: 16px;
          font-weight: 400;
          width: 300px;
          line-height: 130%;
          letter-spacing: -0px;
          color: black;
      }

      .note p{
          font-size: 14px;
          letter-spacing: -0.2px;
          line-height: 140%;
      }

      .note_title{
        width: 100%;
      }

      .header{
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 24px;
      }

      .handle {
        cursor: grab;
        margin-right: 5px;
        opacity: 0.3;
      }


      /* Space */

      .mast{
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 5px;
          margin-bottom: 50px;
      }

      input{
          background: none;
          border: none;
          outline: none;
      }

      input:focus{
          border: none;
          outline: none;
      }

      .icon{
          height: 60px;
          border-radius: 5px;
      }

      .title{
          font-size: 22px;
          font-weight: 700;
          height: 30px;
          margin-bottom: 5px;
      }

      .subtitle{
          font-size: 16px;
          font-weight: 400;
          height: 24px;
      }


      @media screen and (max-width: 900px){

        .notes{
          width: calc(90vw - 10px);
        }
      }

  </style>

