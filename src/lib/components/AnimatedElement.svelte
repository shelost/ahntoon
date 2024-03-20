<script lang="js">
    import { fade } from 'svelte/transition';
    import { inview } from 'svelte-inview';

    let isInView;

    export let text;
    export let color;
  </script>

  <div
    class="wrapper"
    use:inview={{ unobserveOnEnter: true, rootMargin: '-20%' }}
    on:change={({ detail }) => {
      isInView = detail.inView;
    }}
  >
    {#if isInView}
      <div in:fade class="box">
        <p style='color: {color}'>
          {text}
        </p>
      </div>
    {/if}
  </div>

  <style>
    .wrapper {
        margin-top: 30px;
    }

    .box{
        transition: 0.1s ease;
    }

    .elem{
        margin: auto;
        margin-bottom: 150px;
        text-align: center;
        font-weight: 200;

    }

    p{
        font-size: 14px;
        line-height: 250%;
        margin: auto;
        letter-spacing: 0.15px;
        font-weight: 200 !important;
        opacity: 0.7;
        text-align: center;
    }

    @media screen and (max-width: 800px){

        .elem{
            width: 80vw;
        }

        p{
            font-size: 13px !important;
            width: 80vw;
            text-align: center;
        }
    }

</style>