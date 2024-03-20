<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    export let data;
    export let page = false;

    let updatedTitle = data.title;
    let updatedBody = data.body;

    let site = writable([])
    let elems = writable([])


    onMount(() => {

        fetchNote()

        let body = JSON.parse(data.body)

        if (typeof body != Array || !body[0].type){

            let res = []

            for (let i=0; i<body.length; i++){
                let obj = body[i]
                res.push(obj)
                console.log(obj)
            }

            elems.set(res)

            console.log($elems)
        }


        setTimeout(() => {
            updateTextareaHeights()
        }, 100);


        $: updateTextareaHeights()



        window.onkeyup = e => {
        }
    })


    function updateTextareaHeights(){
        for (let i=0; i<document.getElementsByTagName('textarea').length; i++){
            let area = document.getElementsByTagName('textarea')[i]
            adjustTextareaHeight(area)
        }
    }

    /////
    function handleInput(e){

        let index = JSON.parse(e.target.parentElement.id.substring(5))
        let elem = e.target

        // delete on backspace

        console.log(e.inputType)

        if (e.inputType == 'deleteContentBackward' && elem.value.length == 0){
            console.log(index)
            console.log($elems.length)
            $elems.splice(index, 1)
            console.log($elems.length)

            setTimeout(() => {
                //updateNote()
                fetchNote()
               // updateTextareaHeights()
            }, 500);

        }

        // separate on new line

        if (elem.value.includes("\n\n")){

            let i = elem.value.indexOf("\n\n")
            let arr = elem.value.split("\n\n")


            console.log($elems.length)


            $elems.splice(i, 1)

            let objs = []
            for (let j=0; j<arr.length; j++){
                let obj = {
                    type: 'p',
                    content: arr[j],
                    animation: null
                }
                objs.push(obj)

                console.log(arr[j])
            }


            elems.set($elems.slice(0,i).concat(objs, $elems.slice(i, $elems.length)))

            console.log($elems.length)


            setTimeout(() => {
                updateNote()
                fetchNote()
                updateTextareaHeights()
            }, 500);
        }
    }

    /////


    function backspace(e){
        let index = JSON.parse(e.target.parentElement.id.substring(5))
        if (e.inputType == 'deleteContentBackward' && e.target.value.length == 0){
            console.log($elems.length)
            $elems.splice(index, 1)
            console.log($elems.length)
            updateNote()
            fetchNote()
            console.log('rr')
        }
    }




    async function fetchNote(){
        const { data: d, error } = await supabaseClient
        .from('notes')
        .select('*')
        .eq('id', data.id);

      if (!error) {

        data.body = JSON.parse(d[0].body)
        elems.set(data.body)

      } else {
        console.error('Error fetching note:', error);
      }
    }

    async function updateNote() {

      const { data: updatedData, error } = await supabaseClient
        .from('notes')
        .update({
          title: updatedTitle,
          body: JSON.stringify($elems),
        })
        .eq('id', data.id);

      if (!error) {

        //console.log($elems)

      } else {
        console.error('Error updating note:', error);
      }
    }


    // Function to adjust the height of textarea elements
     // Function to adjust the height of textarea elements
    function adjustTextareaHeight(div) {

        if (div){
            const textarea = div
            textarea.style.height = '0px'
            textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
        }

    }

    function adjustTextareaHeightEvent(event) {
        const textarea = event.target
        textarea.style.height = '0px'
        textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
    }


    function Id(id){
        return document.getElementById(id)
    }

    function Tag(id){
        return document.getElementsByTagName(id)
    }


</script>




<div id = 'app'>


<section id = 'scroll' in:fly="{{ y: 200, duration: 500, delay: 200 }}" style="overflow-y: auto;">


    <textarea
        id="note-title"
        bind:value={updatedTitle}
        placeholder="Untitled Article"
        on:input={updateNote}
    ></textarea>


    {#each $elems as elem, i}

        <div class = 'elem' id = 'elem-{i}'>
            <div class = 'menu'> {i} </div>
            <textarea class = 'content'
            bind:value={elem.content}
            on:input={updateNote}
            on:input={adjustTextareaHeightEvent}
            on:input={handleInput}
        ></textarea>
        </div>

    {/each}


</section>

</div>

<div id = 'bar'>
    <div id = 'progress'></div>
</div>

<style>

    .elem{
        background: rgba(0,0,0,0.05);
        margin: 20px;
        padding: 25px;
        border-radius: 10px;
        width: 100%;
    }

    textarea{
        background: none;
        border: none;
        width: 100%;
        resize: none;
        overflow-y: hidden;
    }

    #app{
        height: 100vh !important;
        padding-top: 120px;
        overflow: visible;
    }

    #buttons{
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button{
        background: rgba(0,0,0,0.05);
        color: black;
        font-weight: 600;
        box-shadow: none;
        border-radius: 8px;
    }

    button:hover{
        background: rgba(0,0,0,0.1);
    }


    #scrollable .elem{
        background: red;
        padding: 20px;
        box-shadow: 0px 10px 30px rgba(0,0,0,0.3);
    }

    #app{
        height: calc(100vh - 60px);
        padding-bottom: 100px;
        overflow-y: hidden;
    }

    #title{
        font-size: 22px;
        font-weight: 700;
    }


    section {
      width: 800px;
      max-width: 90vw;

      height: calc(100vh - 150px);
      border-radius: 20px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow: visible;
      margin: auto;


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
      overflow-y: scroll;
      flex-shrink: 0;

        flex: 1;

      padding: 40px;
      box-shadow: 0px 20px 50px rgba(0,0,0,0.1);
    }

    textarea:focus {
      @apply ring-0;
    }
  </style>
