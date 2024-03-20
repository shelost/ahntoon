<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import Notes from '$lib/components/Notes.svelte';
    import { fly } from 'svelte/transition';

    export let data;
    export let page = false;

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

    async function handleFileUpload(event, field) {
      const file = event.target.files[0];
      if (!file) return;

      const { data: uploadedFile, error: uploadError } = await supabaseClient.storage
        .from('images')
        .upload(`space/${data.slug}/${field}/${file.name}`, file);

      if (!uploadError) {
        data[field] = supabaseClient.storage
          .from('images')
          .getPublicUrl(`space/${data.slug}/${field}/${file.name}`).data.publicUrl;

        const { data: updatedData, error: updateError } = await supabaseClient
          .from('spaces')
          .update({ [field]: data[field] })
          .eq('id', data.id);

        updateSpace();

        if (!updateError) {
          console.log(`${field} updated successfully:`, updatedData);
        } else {
          console.error(`Error updating ${field}:`, updateError);
        }
      } else if (uploadError.statusCode == '409') {
        data[field] = supabaseClient.storage
          .from('images')
          .getPublicUrl(`space/${data.id}/${field}/${file.name}`).data.publicUrl;

        const { data: updatedData, error: updateError } = await supabaseClient
          .from('spaces')
          .update({ [field]: data[field] })
          .eq('id', data.id);

        updateSpace();
      } else {
        console.error('Error uploading file:', uploadError);
      }
    }

    async function updateSpace() {
      const { data: updatedData, error } = await supabaseClient
        .from('spaces')
        .update({
          title: data.title,
          subtitle: data.subtitle,
          icon: data.icon,
          cover: data.cover,
          banner: data.banner,
          description: data.description,
          color: data.color,
          secondary: data.secondary,
          music: data.music,
          slug: data.slug,
          music_title: data.music_title
        })
        .eq('id', data.id);


      if (!error) {
        console.log('Space updated successfully:', updatedData);
      } else {
        console.error('Error updating space:', error);
      }
    }
       // Function to adjust the height of textarea elements
      function adjustTextareaHeight(div) {

        const textarea = div

        if (div){
          textarea.style.height = '0px'
          textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content

        }

      }

      function adjustTextareaHeightEvent(event) {

        const textarea = event.target
        textarea.style.height = '0px'
        textarea.style.height = Math.ceil(textarea.scrollHeight) + 'px'; // Adjust rows based on content
      }


    // Throttle the file upload function to avoid rapid calls
    import { throttle } from 'lodash';
    const handleFileUploadThrottled = throttle(handleFileUpload, 1000);

    // Clean up the throttle function on component destruction
    onDestroy(() => {
      handleFileUploadThrottled.cancel();
    });

    async function handleMusicUpload(event) {
      var files = event.target.files;
      let file = files[0]
      const { data: uploadedFile, error: uploadError } = await supabaseClient.storage
        .from('music')
        .upload(`${file.name}`, file);


        data.music = supabaseClient.storage
          .from('music')
          .getPublicUrl(`${file.name}`).data.publicUrl;

        data.music_title = file.name

        const { data: updatedData, error: updateError } = await supabaseClient
          .from('spaces')
          .update({ music: data.music, music_title: data.music_title })
          .eq('id', data.id);

        updateSpace();

        if (!updateError) {

          document.getElementById('src').src = data.music

          console.log(`Music updated successfully:`, updatedData);
        } else {
          console.error(`Error updating music:`, updateError);
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


</script>

<!-- HTML -->

<div id="app" in:fly={{ x: -200, duration: 300, delay: 300 }} out:fly={{ x: 200, duration: 300 }}>

    <div class = 'flex'>

    <!-- Mast -->
    <div class="mast">


      <div class="expo">
        <textarea id="title" bind:value={data.title}
                placeholder="Untitled Space"
                on:change={updateSpace}
                on:input|preventDefault={adjustTextareaHeightEvent}></textarea>
        <textarea id="subtitle" bind:value={data.subtitle}
                  placeholder="A place for my awesome stuff"
                  on:change={updateSpace}
                  on:input|preventDefault={adjustTextareaHeightEvent}></textarea>
      </div>

      <div class = 'secs'>
          <div class = 'sec'>
            <h1 class = 'section_title'> Description </h1>

            <textarea id = 'description'
                bind:value={data.description}
                placeholder="An Awesome Novel"
                on:change={updateSpace}
                on:input|preventDefault={adjustTextareaHeightEvent}></textarea>
          </div>

        </div>
          <div class = 'sec'>

            <h1 class = 'section_title'> Color </h1>

            <div class = 'pill'>
              <div class = 'c' style='background:{data.color}'></div>
              <input id = 'color' type ='text' bind:value={data.color}>
            </div>

            <div class = 'pill'>
              <div class = 'c' style='background:{data.secondary}'></div>
              <input id = 'secondary' type ='text' bind:value={data.secondary}>
            </div>

          </div>





            <!-- Icon -->
            <div id="icon-container" class = 'container'>

              <h1 class = 'section_title'> Icon </h1>

              <div class = 'box'>

                  <img id="icon" class = 'file' src={data.icon} alt="Scrollable Icon" />

                  <label id = 'icon-upload-container' class = 'upload-container'>
                  <input
                    type="file"
                    id="icon-upload"
                    accept="image/*"
                    on:change={(event) => handleFileUploadThrottled(event, 'icon')}
                  />
                  Upload File
                  </label>

                </div>
            </div>




          <!-- Banner -->

          <div id="cover-container" class = 'container'>

            <h1 class = 'section_title'> Cover </h1>

            <div class = 'box'>

              <img id="cover" class = 'file' src={data.cover} alt="Banner Image" />

              <label id = 'cover-upload-container' class = 'upload-container'>
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  on:change={(event) => handleFileUploadThrottled(event, 'cover')}
                />
                Upload File
                </label>

              </div>

          </div>



          <!-- Mast -->

          <div id="mast-container" class = 'container'>

            <h1 class = 'section_title'> Mast </h1>

            <div class = 'box'>

              <img id="mast" class = 'file' src={data.mast} alt="Mast Image" />

              <label id = 'mast-upload-container' class = 'upload-container'>
                <input
                  type="file"
                  id="mast-upload"
                  accept="image/*"
                  on:change={(event) => handleFileUploadThrottled(event, 'mast')}
                />
                Upload File
                </label>

              </div>

          </div>

          <!-- Music -->
          <div id = 'music-container' class = 'container'>
            <h1 class = 'section_title'> Music </h1>
            <div class = 'box'>
              <h2> {data.music_title} </h2>
              <label id = 'music-upload-container' class = 'upload-container'>
                <input type="file" src = {data.music} id="upload" on:change={handleMusicUpload}/>
                Upload File
              </label>
            </div>
          </div>


    </div>

    <!-- Scroll -->
    <div class="scroll" in:fly={{ x: -200, duration: 300, delay: 300 }} out:fly={{ x: 200, duration: 300 }}>
      <h1 class="header"> Chapters </h1>
      <Notes {data} page = {false} icon={data.icon} />
    </div>




</div>
</div>


<style>

  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,200;1,6..72,300;1,6..72,400;1,6..72,500;1,6..72,600;1,6..72,700;1,6..72,800&display=swap');

  #start{
    background: #ffce00;
    color: black;
    border-radius: 100px;
    padding: 15px 30px;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.3px;

  }

  input{
    color: black;
  }

  #start:hover{
    background: #ffc000;
  }

      #app{
          min-height:100vh;
          padding: 50px;
          height: 200px;
          overflow-y: scroll;
          position: relative;
          background: white;
          color: black;
      }

      .carousel{
        display: flex;
        gap: 20px;
        justify-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      .header{
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 30px;
          margin-top: 40px;

      }

      .section_title{
        font-weight: 600;
        font-size: 14px;
        margin: 10px 0;
      }

      .sec p{
        font-weight: 400;
        font-size: 14px;
        color: rgba(0,0,0,0.3);
      }

      .flex{
        display: flex;
        gap: 60px;
      }


      .pill{
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }

      .pill input{
        background: rgba(0,0,0,0.05) !important;
        padding: 10px;
        padding-left: 15px;
        border-radius: 8px;
        font-size: 14px;
      }

      .file{

      }

      .c{
        width: 32px;
        height: 32px;
        border-radius: 5px;
        border: 1px solid rgba(255,255,255,0.3);
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

      .label{
        color: rgba(0,0,0,0.5);
        margin-bottom: 5px;
        font-size: 14px;
      }

      .box{
        display: flex;
        align-items: center;
        background: rgba(0,0,0,0.05);
        padding: 15px;
        width: 100%;
        align-self: stretch;
        border-radius: 10px;
      }

      /* Cover */

      #cover-container{
        position: relative;
        transition: 0.1s ease;
        cursor: pointer;
        width: 150px;
        height: 150px;
      }
      #cover-upload{
        display: none;
      }

      #cover{
        height: 150px;
      }


      /* Mast */

      #mast-container{
        position: relative;
        transition: 0.1s ease;
        cursor: pointer;
        width: 150px;
        height: 150px;
        margin-top: 30px;
      }
      #mast-upload{
        display: none;
      }

      #mast{
        height: 150px;
      }




      /* Music */


      #music-container{
        margin-top: 40px;
      }

      #upload{
        display: none;
      }


      /* Icon */

      #icon-container{
        position: relative;
        transition: 0.1s ease;
        cursor: pointer;
        width: 150px;
        height: 150px;

      }

      #icon-upload{
        display: none;
      }



      #icon-upload-container{
        display: block;
        position: auto;
      }

      #icon{
        height: 120px;
        width: 120px;
        margin-bottom: 5px;
        transition: 0.2s ease;

      }


      /* Banner */



      .expo{
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: 5px;
      }


      .upload-container{
        color: black;
        display: inline-block;
        width: 120px;
        height: 35px;
        line-height: 35px;
        cursor: pointer;
        border-radius: 5px;
        text-align: center;
        transition: 0.2s ease;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: -0.2px;
        background: white;
        margin-top: 10px;
        white-space: nowrap;
        margin: auto;
        margin-top: 50px;
      }

      textarea{
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
          font-family: 'Libre Baskerville', 'Manrope', 'Inter', sans-serif;
          font-size: 60px;
          font-weight: 800;
          margin-bottom: 20px;
          margin-top: -30px;
          letter-spacing: -2.5px;
          line-height: 100%;
          height: 54px;
          width: 100%;
          color: black;
      }

      #description{
          font-size: 14px;
          font-weight: 400;
          height: 24px;
          letter-spacing: -0.2px;
          width: 500px;
          line-height: 140%;
          color: rgba(0,0,0,1);
          background: rgba(0,0,0,0.05);
          padding: 20px;
          border-radius: 10px;
      }

      .container{
        margin-bottom: 50px;
        width: 100% !important;
      }

      #subtitle{
          font-size: 20px;
          font-weight: 400;
          height: 24px;
          letter-spacing: -0.2px;
          width: 100%;
          color: black;
      }

      h1{
        color: black;
      }

      .scroll{
        margin-top: -70px !important;
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

