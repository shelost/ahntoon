
<script lang="ts">
  import { supabaseClient } from '$lib/db';
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import Notes from '$lib/components/Notes.svelte';
  import { fly } from 'svelte/transition';

  export let data


  const chapters = writable([])

  fetchChapters()


  onMount(() => {
        adjustTextareaHeight(document.getElementById('title'))
        adjustTextareaHeight(document.getElementById('body'))
        adjustTextareaHeight(document.getElementById('description'))

        window.onresize = () => {
          adjustTextareaHeight(document.getElementById('title'))
          adjustTextareaHeight(document.getElementById('body'))
          adjustTextareaHeight(document.getElementById('description'))
        }
  })

  // Function to adjust the height of textarea elements
  function adjustTextareaHeight(div) {

    const textarea = div

    if (div){
      textarea.style.height = '0px'
      textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
    }
  }


  async function fetchChapters(){

    const { data: d, error} = await supabaseClient
        .from('chapters')
        .select('*')
        .eq('series_id', data.id)
        .eq('published', true);

    if (!error){
      chapters.set(d.reverse())

    }else{
      console.log('Error fetching chapters: ' + error)
    }
  }

  fetchChapters()


</script>




<div id="app" in:fly={{ y: 100, duration: 200}} out:fly={{ y: -100, duration: 200}}>


<div id = 'bar'>

  <a href = '../../'>
    <div id = 'back'>
      <h2> Back </h2>
    </div>

  </a>

    <div id = 'settings'>
      Settings
    </div>
  </div>


  <div id = 'banner' style = 'background-image: url({data.banner})'></div>



  <div class = 'flex'>



  <!-- Mast -->
  <div class="mast">

     <!-- Banner -->

     <img id="icon" src={data.icon} alt="Scrollable Icon" />



    <div class="expo">
      <textarea id="title" bind:value={data.title}
              placeholder="Untitled Space" disabled></textarea>
      <textarea id="subtitle" bind:value={data.subtitle}
                placeholder="A place for my awesome stuff" disabled></textarea>
    </div>


    <div class = 'secs'>

      <div class = 'sec'>
        <h1> Description </h1>
        <textarea id = 'description'
            bind:value={data.description}
            placeholder="An Awesome Novel" disabled></textarea>
      </div>

      <!--
      <button id = 'start'> Begin Reading </button>
      -->

    </div>

  </div>

  <!-- Scroll -->
  <div class="scroll" in:fly={{ x: -200, duration: 300, delay: 300 }} out:fly={{ x: 200, duration: 300 }}>
    <h1 class="header"> Chapters </h1>
    <!--
    <Notes {data} page = {true} icon={data.icon} />
    -->

    <div id = 'chapters'>

      {#each $chapters as chapter}

      <a href='{data.slug}/chapter/{chapter.n}'>

        <div class = 'chapter'>

          <div class = 'head'>
            <h3> {chapter.n} </h3>
            <div class = 'thumbnail' style = 'background-image: url({chapter.thumbnail})'></div>
            <h1> {chapter.title} </h1>
          </div>

          <h2> {chapter.date} </h2>
        </div>
      </a>

      {/each}

    </div>

  </div>




</div>
</div>


<style lang="scss">

@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,200;1,6..72,300;1,6..72,400;1,6..72,500;1,6..72,600;1,6..72,700;1,6..72,800&display=swap');

    #app{
        min-height:100vh;
        padding: 50px;
        height: 200px;
        overflow-y: scroll;
        position: relative;
        background: white;
        color: black;
    }



    #chapters{



      .chapter{
        background: #f0f0f0;
        padding: 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        transition: 0.2s ease;
        cursor: pointer;



        .head{
          display: flex;
          align-items: center;
          gap: 15px;
          .thumbnail{
            width: 48px;
            height: 48px;
            background: #c7c7c7;
            border-radius: 5px;
            background-size: cover;
            background-position: center center;
          }

          h1{
            font-weight: 600;
            font-size: 16px;
            letter-spacing: -0.2px;
          }

          h3{
            font-size: 14px;
            background: #e0e0e0;

            width: 32px;
            height: 32px;
            font-weight: 600;
            border-radius: 15px;
            text-align: center;
            line-height: 32px;
          }
        }

        h2{
          font-size: 14px;
          font-weight: 400;
          color: rgba(0,0,0,0.3);
        }

        &:hover{
          transform: translateX(-10px);
        }






      }


      &:first-child{

.head{
  h1{
    font-size: 24px;
    letter-spacing: 0px;
    font-weight: 700;
  }
}

.thumbnail{
  width: 84px;
  height: 84px;
}
}


    }

    .header{
        font-size: 22px;
        font-weight: 500;
        margin-bottom: 30px;
        margin-top: 40px;

    }

    .sec{

      h1{
        font-weight: 600;
        font-size: 14px;
        margin: 10px 0;
      }


      p{
        font-weight: 400;
        font-size: 14px;
        color: rgba(0,0,0,0.3);
      }

    }


    .flex{
      display: flex;
      gap: 60px;
      margin-top: 130px;
    }

    /* Space */

    .mast{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 10px;
        margin-bottom: 50px;
        width: 540px;
        position: relative;
        flex-shrink: 0;
    }

    #bar{
      position: fixed;
      z-index: 5;
      top: 0;
      left: 0;
      width: 100vw;
      height: 50px;
      padding: 0 0px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 300;
      color: white;

      #back{
        background: rgba(black, 0.8);
        padding: 8px 16px;
        border-radius: 0 50px 50px 0;
        transition: 0.2s ease;

        h2{
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.1px;
        }

        &:hover{
          transform: translate(-5px, 0);
          background: rgba(black, 0.6);
        }
      }

    }


    #banner {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100vw;
      height: 20vw;
      transition: 0.2s ease;

      background-size: cover;
      background-position: center 30%;
      background-blend-mode: color-burn;

      background-color: rgba(#ffce00, 0.1);
    }

    #icon{
      width: 180px;
      border-radius: 5px;
    }

    .expo{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 5px;
    }


    textarea{
      background: none;
      border: none;
      outline: none;
      padding: 0;
      border: none;
      padding: none;
      resize: none; /* Disable resizing for better control over textarea height */
      overflow-y: hidden; /* Hide vertical scrollbar */
      flex-shrink: 0;
    }

    textarea:focus{
        border: none;
        outline: none;
        padding: 0;
        @apply ring-0;
    }

    #title{
        font-family: 'Newsreader', 'Libre Baskerville', 'Manrope', 'Inter', sans-serif;
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 20px;
        margin-top: 30px;
        letter-spacing: -0.6px;
        line-height: 100%;
        height: 54px;
        width: 100%;
    }

    #description{
      font-size: 14px;
        font-weight: 400;
        height: 24px;
        letter-spacing: -0.2px;
        width: 500px;
        line-height: 140%;
        color: rgba(0,0,0,0.4);
    }

    #subtitle{
        font-size: 20px;
        font-weight: 400;
        height: 24px;
        letter-spacing: -0.2px;
        width: 100%;
    }

    .scroll{
      margin-top: 100px;
      flex: 1 !important;
    }

    .secs{
      margin-top: 30px;
    }


@media screen and (max-width: 800px){

  #banner-container{
    height: 200px;
  }

  #banner{
    height: 200px;
  }

  .scroll{
    margin-top: -100px;
  }

  #app{
    padding: 30px;
  }

  .flex{
    flex-direction: column;
  }

  .mast{
    width: 90vw;
  }

  #title{
    width: 90vw;
    font-size: 40px;
    line-height: 120%;
  }

  .mast{
    margin-top: -40px;
  }

  .secs{
    width: 90vw;
  }

  #description{
    width: 85vw;
  }

  #banner{
    width: 100vw;
  }

}

</style>

