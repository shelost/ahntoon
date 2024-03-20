<script lang="ts">
  import { supabaseClient } from '$lib/db';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import AnimatedElement from '$lib/components/AnimatedElement.svelte';
  import Jagged from '$lib/img/jagged.svg'

  export let data;

  let updatedTitle = data.title;
  let updatedBody = data.body;

  let elems = writable([])
  let space = getSpace()
  let title = null

  let next = {}
  let prev = {}

  let scrolling = false

  const ELEMS = data.body.split('\n');

  elems.update((currentElems) => {
      // Update the elems store with new content
      return ELEMS.map((E) => ({
        type: 'p',
        content: E,
      }));
  });

  async function getSpace(){
    const { data: s, error } = await supabaseClient
      .from('spaces')
      .select('*')
      .eq('id', data.space_id)
      .single()

    if (!error) {


      return s

    } else {
      console.error('Error fetching space', error);
    }
  }

  async function getAdjacentNotes(){

    try {

      const { data: n, error: e1 } = await supabaseClient
        .from('notes')
        .select('*')
        .match({ index: data.index+1, space_id: data.space_id })
        .single()

      if (!e1) {
        next = n

        console.log(n, data.index+1)
      }else{
        for (let i=0; i<Class('next').length; i++){
          let btn = Class('next')[i]
          btn.disabled = true
        }
      }

    }catch{

    }

    if (data.index > 0){
      try {
        const { data: p, error: e2 } = await supabaseClient
          .from('notes')
          .select('*')
          .match({ index: data.index-1, space_id: data.space_id })
          .single()

        if (!e2) {
          prev = p
          console.log(p, data.index-1)
        }else{
          for (let i=0; i<Class('prev').length; i++){
            let btn = Class('prev')[i]
            btn.disabled = true
          }
        }
      }catch{

      }
    }

  }


  var isPlaying = false;

      function togglePlay() {
        isPlaying ? audio.pause() : audio.play();

        for (let i=0; i<Class('wave').length; i++){
          let wave = Class('wave')[i]

          isPlaying ? wave.classList.add('paused') : wave.classList.remove('paused')
        }

      };

      let clicked = false
      let speed = 1

  onMount(() => {
    getSpace()
    getAdjacentNotes()
    adjustTextareaHeight(document.getElementById('note-title'))
    adjustTextareaHeight(document.getElementById('note-body'))





    let scrolldelay

    setTimeout(() => {

      let audio = document.getElementById("audio")

      audio.load()

      audio.onplaying = function() {
        isPlaying = true;
      };
      audio.onpause = function() {
        isPlaying = false;
      };

      const s = Id('scrollable')
      let scroll = Id('app')
      let progress = Id('progress')


      Id('fab').onclick = () => {
        scrolling = !scrolling
        pageScroll()
      }

      window.onkeyup = e => {

        if (e.code == 'Space'){
          scrolling = !scrolling
          pageScroll()
        }
      }

      function pageScroll() {
        if (scrolling){
          scroll.scrollBy(0,speed);
          scrolldelay = setTimeout(pageScroll,10);
        }
      }




      let loop = () => {
        for (let i=0; i<Class('next').length; i++){
          let btn = Class('next')[i]
          btn.onclick = () => {
            console.log(next.id)
            if (next.id){
              window.location.href = next.id
            }else{
              btn.disabled = true
            }
          }
        }


        for (let i=0; i<Class('prev').length; i++){
          let btn = Class('prev')[i]
          if (data.index > 0){
              btn.onclick = () => {
              console.log(prev.id)
              if (prev.id){
                window.location.href = prev.id
              }
            }
          }else{
            btn.disabled = true
          }
        }

        progress.style.width = Math.ceil((scroll.scrollTop / scroll.scrollHeight) * window.innerWidth) + 'px'
        window.requestAnimationFrame(loop)
      }
      window.requestAnimationFrame(loop)

    }, 1000);
  })


  async function updateNote() {
    const { data: updatedData, error } = await supabaseClient
      .from('notes')
      .update({
        title: updatedTitle,
        body: updatedBody,
      })
      .eq('id', data.id);
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

      if (div){
          const textarea = div
          textarea.style.height = '0px'
          textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
          console.log(textarea)
          console.log(textarea.style.height)
      }

  }

  function adjustTextareaHeightEvent(event) {
      const textarea = event.target
      textarea.style.height = '0px'
      textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
      console.log(textarea)
      console.log(textarea.style.height)
  }


  function Id(id){
      return document.getElementById(id)
  }

  function Tag(id){
      return document.getElementsByTagName(id)
  }

  function Class(id){
      return document.getElementsByClassName(id)
  }


</script>






{#if data}
  {#await space}

  <div id = 'loading'>
    <div class="lds-ripple"><div></div><div></div></div>
    <h1> Loading... </h1>
  </div>


  {:then space}


  <div id = 'app' style='background: {space.color}'>


    <div id = 'music'>
      <audio id="audio" controls autoplay>
        <source src="{space.music}" id="src" />
      </audio>
      <div class = 'flex'>
        <div id = 'waveform'>
          <div class="wave wave1">
          </div>
          <div class="wave wave2">
          </div>
          <div class="wave wave3">
          </div>
        </div>
        <h3 id ='music_title'> {space.music_title} </h3>
      </div>

      <div id = 'play' on:click={togglePlay}>

        {#if isPlaying}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="21" y="12" width="19" height="75" rx="9.5" fill="white"/>
            <rect x="61" y="12" width="19" height="75" rx="9.5" fill="white"/>
          </svg>
        {:else}
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M79.7778 45.9586L25.1537 11.7179C22.0306 9.76019 18 12.0372 18 15.7593V84.2407C18 87.9628 22.0306 90.2398 25.1537 88.2821L79.7778 54.0414C82.7407 52.1841 82.7407 47.8159 79.7778 45.9586Z" fill="white"/>
          </svg>
        {/if}

      </div>


    </div>



  <div id = 'header'>
      <div class = 'mast'>
        <a href = '../'>
          <button class = 'nav' id = 'back'>
            <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 10.5L16 21L16 0L0 10.5Z" fill="white"/>
            </svg>
          </button>
        </a>
        <h2 id = 'title'> {space.title} </h2>
      </div>

      <div id = 'buttons'>
        <button class = 'nav prev'>
          <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10.5L16 21L16 0L0 10.5Z" fill="white"/>
          </svg>
        </button>
        <h3 id = 'chapter'> {data.title} </h3>
        <button class = 'nav next'>
          <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 10.5L0 0V21L16 10.5Z" fill="white"/>
          </svg>
        </button>
      </div>
  </div>

  <section id = 'scroll' in:fly="{{ y: 200, duration: 500, delay: 200 }}" style="overflow-y: auto;">
    <div id = 'scrollable'  style='background: {space.color}'>

      <div id = 'hero'>
        <img src = {space.icon} alt = 'Scrollable Icon'>
      </div>

      <h1 id = 'chapter_title'> {data.title} </h1>

      {#each $elems as elem}
        <div class = 'elem'>
          <p> . </p>
        </div>
        <AnimatedElement text={elem.content} color={space.secondary}></AnimatedElement>
      {/each}

      <button class = 'cta next'> Next </button>

    </div>
  </section>

  <div id = 'fab'>

    {#if scrolling}

    <svg id = 'ps' width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="21" y="12" width="19" height="75" rx="9.5" fill="white"/>
      <rect x="61" y="12" width="19" height="75" rx="9.5" fill="white"/>
    </svg>

    {:else}

    <svg id = 'pl' width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M79.7778 45.9586L25.1537 11.7179C22.0306 9.76019 18 12.0372 18 15.7593V84.2407C18 87.9628 22.0306 90.2398 25.1537 88.2821L79.7778 54.0414C82.7407 52.1841 82.7407 47.8159 79.7778 45.9586Z" fill="white"/>
    </svg>

    {/if}

  </div>

</div>

  {/await}

{/if}


<div id = 'bar'>
  <div id = 'progress'></div>
</div>


<style>

  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

  :global(#navbar){
    display: none !important;
  }

  #fab svg{
    width: 40px;
    height: 40px;
  }

  #play{
    height: 25px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #play svg{
    height: 15px;
    width: 15px;
  }

  #play svg path{
    fill: black;
  }

  #play svg rect{
    fill: black;
  }


  #fab{
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    right: 30px;
    bottom: 100px;
    background: #FF003D;
    width: 70px;
    height: 70px;
    border-radius: 500px;
    z-index: 5;
    box-shadow: 0x 20px 60px rgba(0,0,0,0.6);
    transition: 0.2s ease;
    cursor: pointer;
  }

  #fab:hover{
    background: #e3002a;
  }

  #fab svg{
    height: 36px;
    width: 36px;
  }




  :root {
    --m: 2;
    --wavefreq: calc(100ms * var(--m));
  }

  #music{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: black;
    width: fit-content;
    border-radius: 12px;
    gap: 20px;
    padding: 15px 20px;

    position: fixed;
    top: 10px;
    left: 15vw;
    width: 70vw;
    box-shadow: 0px 20px 40px rgba(0,0,0,0.3);
    z-index: 5;
  }

  #play{
    background: white;
    cursor: pointer;
    color: black;
    padding: 0 15px;
    border-radius: 50px;
  }

  #music_title{
    font-size: 14px;
  }

  .flex{
    display: flex;
    align-items: center;
    gap: 15px;
  }
  #audio{
    display: none;
  }

  #waveform {
    display: flex;
    gap: 5px;
  }

  .wave{
    animation: waveform var(--wavefreq)
              ease-in-out infinite
              forwards;
    background-color: white;
    border-radius: 15px;
    width: 5px;
    height: 8px;
    background: #0074ff;
  }


  .wave.paused{
    animation: none !important;
    transform: none !important;
    background: yellow !important;
  }


  .wave1 {
    --wavefreq: calc(200ms * var(--m));
  }


  .wave2 {
    --wavefreq: calc(300ms * var(--m));
  }

  .wave3 {
    --wavefreq: calc(400ms * var(--m));
  }

  .wave4 {
    --wavefreq: calc(500ms * var(--m));
  }

  .wave5 {
    --wavefreq: calc(600ms * var(--m));
  }

  .wave6 {
    --wavefreq: calc(700ms * var(--m));
  }





  @keyframes waveform {
  0% {
    transform: scaleY(.5);
  }
  50% {
    transform: scaleY(1.5);
  }
  100% {
    transform: scaleY(.5);
  }
}




  /* Loader */

  .lds-ripple {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #fff;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  4.9% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 0;
  }
  5% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}

.cta{
  width: 100%;
  background: white;
  color: black;
  margin-top: 200px;
}

.cta:hover{
  background: #f6f6f6;
}

  .nav{
    transform: scale(0.6);
  }

  /* Mast */
  .mast{
    display: flex;
    align-items: center;
    gap: 0px;
  }

  #chapter_title{
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 40px;
    letter-spacing: -0.3px;
    color: black !important;
    text-align: center;
  }

  #chapter{
    font-size: 13px;
    color: rgba(255,255,255,0.6);
  }

  button{
    background: black;
    color: white;
  }

  #header{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    z-index: 3;
    background: black;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  #loading{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: black;
    color: white;
  }

  button:hover{
    opacity: 0.7;
  }

  button:disabled{
    opacity: 0.5;
  }


  #app{
    background: black;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw !important;
    height: 100vh !important;
    color: white;
    font-family: 'Libre Baskerville', sans-serif;
  }

  #buttons{
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  button:hover{
      background: rgba(0,0,0,0.1);
  }

  #scroll{
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #scrollable{
    background: red;
    border-radius: 0;
  }

  #hero{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px;
    text-align: center;
    text-justify: center;
    padding: 60px 0;
    width: 800px;
    max-width: 100vw;
    border-radius: 0;
    aspect-ratio: 1;
    background-size: cover;
    background-position: center center;
  }

  #hero img{
    width: 800px;
    max-width: 100vw;
    aspect-ratio: 1;
    border-radius: 0;
  }

  #hero h1{
    font-size: 60px !important;
    text-align: center;
    text-justify: center;
    margin: 20px 0;
    line-height: 95% !important;
    font-weight: 600;
    letter-spacing: -0.6px;
    font-family: 'Newsreader', 'Libre Baskerville', sans-serif;
    white-space: pre-wrap;
    width: 65%;
  }

  #hero h2{
    font-size: 18px;
    opacity: 0.5;
  }

  #app{
      height: calc(100vh - 60px);
      width: 100vw !important;
      padding-bottom: 100px;
      overflow-x: hidden;
      overflow-y: scroll;
  }


  section {
    width: 800px;
    width: 100vw;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow-y: scroll;
    margin: auto;
    margin-top: 20px;
  }

  #scrollable{

    width: 800px;
    max-width: 100vw;
  }

  .elem{
    margin: auto;
    margin-bottom: 50px;
    text-align: center;
    font-weight: 200;
  }


  .elem p{
    font-size: 14px;
    line-height: 200%;
    margin: auto;
    letter-spacing: 0.15px;
    font-weight: 300 !important;
    opacity: 0.7;
    font-family: 'Inter', sans-serif;
    opacity: 0;
  }


  #bar{
      position: fixed;
      bottom: 0;
      left: 0;
      height: 1px;
      width: 100vw;
      background: rgba(0,0,0,0.4);
  }

  #progress{
      position: fixed;
      bottom: 0;
      left: 0;
      height: 1px;
      width: 10px;
      background:white;
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

  @media screen and (max-width: 800px){


    #music{
      width: 94vw !important;
      left: 3vw !important;
    }

    #chapter{
      display: none;
    }


    #hero h1{
      font-size: 40px !important;
      text-align: center;
      text-justify: center;
      line-height: 120%;
      width: 80%;
      margin-top: 60px;
    }

    .elem{
      width: 80vw !important;
    }

    .elem p{
      width: 100% !important;
    }

    .elem p{
      font-weight: 100;
      border-radius: 0;
    }

    #app{
      margin-top: -20px;
      border-radius: 0;
    }

    #hero{
      margin-top: -100px;
    }


  }

</style>
