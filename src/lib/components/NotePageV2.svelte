<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    export let data;
    export let page = false;

    let updatedTitle = data.title;
    let updatedBody = data.body;

    onMount(() => {
        adjustTextareaHeight(document.getElementById('note-title'))
        adjustTextareaHeight(document.getElementById('note-body'))

        if (page){
           // document.getElementById('note-body').readonly = true
        }

        let scroll = document.getElementById('app')
        let progress =  document.getElementById('progress')

        let loop = () => {
            progress.style.width = Math.ceil((scroll.scrollTop / scroll.scrollHeight) * window.innerWidth) + 'px'
            window.requestAnimationFrame(loop)
        }
        window.requestAnimationFrame(loop)
    })

    async function updateNote() {
      const { data: updatedData, error } = await supabaseClient
        .from('notes')
        .update({
          title: updatedTitle,
          body: updatedBody,
        })
        .eq('id', data.id);

      console.log(data.id, error);

      if (!error) {
        console.log('Note updated successfully:', updatedData);
        // Navigate back to the note list page or any other desired location
      } else {
        console.error('Error updating note:', error);
      }
    }

    // Function to adjust the height of textarea elements
     // Function to adjust the height of textarea elements
    function adjustTextareaHeight(div) {

        const textarea = div
        textarea.style.height = '0px'
        textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content

        console.log(textarea)
        console.log(textarea.style.height)
    }

    function adjustTextareaHeightEvent(event) {

        const textarea = event.target
        textarea.style.height = '0px'
        textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content

        console.log(textarea)
        console.log(textarea.style.height)
    }

</script>




<div id = 'app'>


<section id = 'scroll' in:fly="{{ y: 200, duration: 500, delay: 200 }}" style="overflow-y: auto;">
    <textarea
    id="note-title"
    bind:value={updatedTitle}
    placeholder="Untitled Article"
    on:input|preventDefault={adjustTextareaHeightEvent}
    on:input={updateNote}
    ></textarea>
    <textarea
    id="note-body"
    bind:value={updatedBody}
    placeholder="Start your awesome article here..."
    on:input|preventDefault={adjustTextareaHeightEvent}
    on:input={updateNote}
    ></textarea>
</section>


</div>

<div id = 'bar'>
    <div id = 'progress'></div>
</div>

<style>

    #app{
        height: calc(100vh - 60px);
        padding-bottom: 100px;
        overflow-y: scroll;
    }

    #title{
        font-size: 22px;
        font-weight: 700;
    }


    section {
      width: 450px;

      background: white;
      border-radius: 20px;
      box-shadow: 0px 20px 50px rgba(0,0,0,0.1);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow-y: scroll;
      margin: auto;
      margin-top: 20px;
      padding-bottom: 100px;
    }


    #bar{
        position: fixed;
        bottom: 0;
        left: 0;
        height: 10px;
        width: 100vw;
        background: #f0f0f0;
    }

    #progress{
        position: fixed;
        bottom: 0;
        left: 0;
        height: 10px;
        width: 10px;
        background: rgb(255, 0, 115);
    }

    #buttons {
      width: 800px;
      max-width: 90%;
      margin: auto;
      display: flex;
      justify-content: space-between;
      padding: 20px 0;
    }


    #note-title {
      width: 800px;
      max-width: 90%;
      font-size: 28px;
      font-weight: 700;
      border: none;
      outline: none;
      padding: 10px;
      margin: 30px 0;
      letter-spacing: -0.4px;
      line-height: 105%;
      resize: none; /* Disable resizing for better control over textarea height */
      overflow-y: hidden; /* Hide vertical scrollbar */
      flex-shrink: 0;
    }

    #note-body {
      width: 800px;
      max-width: 90%;
      border: none;
      padding: none;
      resize: none; /* Disable resizing for better control over textarea height */
      overflow-y: hidden; /* Hide vertical scrollbar */
      min-height: 300px;
      flex-shrink: 0;
    }

    textarea:focus {
      @apply ring-0;
    }
  </style>
