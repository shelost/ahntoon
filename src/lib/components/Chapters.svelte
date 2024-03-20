<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let data;

    let chapters = writable([]);
    let chapterToEdit = { id: null, title: '', body: '' }; // Store the chapter to be edited


    async function fetchNotes(){
      const { data: n, error } = await supabaseClient
        .from('chapters')
        .select('*')
        .eq('space_id', data.id);
      if (!error) {
        chapters.set(n.reverse());
      } else {
        console.error('Error fetching user_data:', error);
      }
    }

    // Fetch the chapters on mount
    onMount(fetchNotes());

    // Function to save a chapter (either new or edited)
    async function saveNote() {
      if (chapterToEdit.id) {
        const { data, error } = await supabaseClient
          .from('chapters')
          .update({
            title: chapterToEdit.title,
            body: chapterToEdit.body
          })
          .eq('id', chapterToEdit.id);
      } else {
        // Use database-generated UUID
        const { data: d, error } = await supabaseClient
          .from('chapters')
          .insert([
            {
              title: chapterToEdit.title,
              body: chapterToEdit.body,
              space_id: data.id,
              user_id: data.user_id
            }
          ])
          .select('*')

        // Update the chapters store with the newly added chapter
        if (!error) {
          chapters.update((prevNotes) => [...prevNotes, d[0]]);
        } else {
          console.error('Error inserting the new chapter:', error);
        }
      }
      // Clear the form after saving the chapter
      chapterToEdit = { id: null, title: '', body: '' };

      fetchNotes()
    }

    // Function to add new chapter
    function newNote() {
      chapterToEdit = { id: null, title: '', body: '' };
    }
  </script>







    <div class="chapters">

      <div class="add_chapter chapter">
        <input bind:value={chapterToEdit.title} placeholder="Add a chapter...">
        <textarea bind:value={chapterToEdit.body} placeholder="What are you thinking about?"></textarea>
        <button on:click={saveNote}>Add Note</button>
      </div>
      {#each $chapters as chapter}
        <a href="{data.id}/chapter/{chapter.id}">
          <div class="chapter">
            <div class="chapter_expo">
              <h1 class="chapter_title">{chapter.title}</h1>
              <p class="chapter_subtitle">{chapter.body}</p>
            </div>
          </div>
        </a>
      {/each}
    </div>




  <style>
      /* Note */

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

      .chapters{
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        height: 300px;
        padding-bottom: 200px;
      }

      .chapter{
        width: 300px;
        background: white;
        border: 1px solid rgba(0,0,0,0.15);
        border-radius: 8px;
        color: black;
        padding: 25px;
        transform: none;
        transition: 0.2s ease;
      }

      .chapter:hover{
          transform: translateY(-5px);
      }

      .chapter h1{
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
      }


      .chapter p{
          font-size: 14px;
          letter-spacing: -0.2px;
          line-height: 140%;
      }



      .header{
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 24px;
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


  </style>

