<script>
	import { scale } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';
    export let space;
    export let page = false;

    const dispatch = createEventDispatcher();

    function triggerDelete() {
        dispatch('deleteSpace', space.id); // emit the delete event with the space id.
    }

</script>



{#if page}

<a class = 'space_a' href='p/{space.slug}'>
    <div class = 'container'>
        <div class = 'background' style='background-image: url({space.icon})'></div>
        <div class='space' >
        </div>

        <div class = 'expo'>
            <h1> {space.title} </h1>
            <h2> {space.subtitle} </h2>
        </div>
    </div>
</a>

{:else}
<section>
<a class = 'space_a' href='dashboard/space/{space.slug}'>
    <div class = 'container'>
        <div class = 'background' style='background-image: url({space.icon})'></div>
        <div class='space' >

        </div>
        <div class = 'expo'>
            <h1> {space.title} </h1>
            <h2> {space.subtitle} </h2>
        </div>
    </div>
</a>
<button on:click={triggerDelete}>Delete</button>
</section>
{/if}


<style lang="scss" >


section{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

button{
    background: rgba(255,255,255,0.1);
    color: white;
    margin-top: 10px;
}


.expo{
    text-align: left;
    margin: 15px 0;
    color: black;

    h1{
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.3px;
        line-height: 110%;
        margin-bottom: 5px;
    }

    h2{
        font-size: 14px;
        font-weight: 400;
        letter-spacing: -0.3px;
        color: rgba(black, 0.5);
    }

}

    .background{
        display: block;
        width: 200px;
        height: 200px;
        background-size: cover;
        background-position: center center;
        transition: 0.2s ease;
        box-shadow: 0px 20px 50px rgba(0,0,0, 0.1);
        border-radius: 10px;
        border: 2px solid rgba(255,255,255, 0.05);
    }

    .container{
        width: 200px;
        height: 200px;
        //background: white;
        border-radius: 20px;
        position: relative;
        transition: 0.2s ease;
        margin-bottom: 100px;
    }

    .space{
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 20px;
        width: 200px;
        height: 200px;

        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        transition: 0.2s ease;
        text-align: center;
        opacity: 0;

    }

    .container:hover .background{
        transform: scale(0.95);
    }

    .space_expo h1{
        font-size: 22px;
        line-height: 120px;
        width: 120px;
        height: 120px;
        text-align: center;
        border-radius: 70px;

        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.3);
    }


    a:hover{
        text-decoration: none;
    }

    .space_icon{
        height: 100px;
        border-radius: 10px;
        box-shadow: 0px 15px 40px rgba(0,0,0,0.1);
        background: none;
        transition: 0.2s ease;
    }

    .space_title{
        font-family: 'Manrope', 'Inter', sans-serif;
        font-size: 18px;
        line-height: 110%;
        width: 95%;
        font-weight: 800;
        margin: auto;
        margin-top: 20px;
        margin-bottom: 10px;
        text-align: center;
    }

    .space_subtitle{
        font-size: 16px;
        font-weight: 400;
        letter-spacing: -0.05px;
        margin: auto;
        color: rgba(255,255,255, 0.8);
    }


    @media screen and (max-width: 800px){

        .background{
            width: 80vw;
            height: 140vw;
        }


        .space{
            width: 80vw;
            height: 140vw;
        }


        .container{
            width: 80vw;
            height: 140vw;
        }

    }
 </style>