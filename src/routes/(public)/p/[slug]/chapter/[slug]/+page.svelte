<script>

    import { supabaseClient } from '$lib/db';
    import { onMount, onDestroy, tick } from 'svelte';
    import { writable } from 'svelte/store';
    import Notes from '$lib/components/Notes.svelte';
    import { fly } from 'svelte/transition';

    export let data

    let n = data.n

    const pages = writable([])
    const scrolls = writable([])

    let pageNumber = 1; // Default to the first page
    let mode = 'G'
    let wasAbove800;

    let highlight;

    async function setMode(selectedMode) {
        mode = selectedMode;
        await tick(); // Wait for the DOM to update
        updateHighlight();
    }

    function updateHighlight() {
        const activeLabel = document.querySelector('.labels span.active');
        const { width, height, top, left } = activeLabel.getBoundingClientRect();
        const containerRect = highlight.parentNode.getBoundingClientRect();

        highlight.style.width = `${width + 36}px`;
        highlight.style.height = `${height + 10}px`;
        highlight.style.top = `${top - containerRect.top - 5}px`;
        highlight.style.left = `${left - containerRect.left - 18}px`;
    }


    async function fetchImages(){

        const { data: d, error } = await supabaseClient
            .storage
            .from('img')
            .list(n + '/A', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (!error){

            const images = d.map(file => {
                const { data, error: urlError } = supabaseClient
                    .storage
                    .from('img')
                    .getPublicUrl(n + `/A/${file.name}`);

                if (urlError) {
                    console.error('Error getting public URL:', urlError);
                    return null;
                }

                return { ...file, url: data.publicUrl }; // Note the lowercase 'u' in ''p'ublicUrl'
            }).filter(Boolean); // Filter out any null values


            images.sort((a, b) => {
                // Regular expression to extract the trailing number from filenames
                const regex = /(\d+)(?!.*\d)/;
                const matchA = a.name.match(regex);
                const matchB = b.name.match(regex);

                // Convert matches to numbers; if no number is found, use -1 to sort these items first
                const numA = matchA ? parseInt(matchA[0], 10) : -1;
                const numB = matchB ? parseInt(matchB[0], 10) : -1;

                // Compare the numbers for sorting
                if (numA < numB) return -1;
                if (numA > numB) return 1;

                // If numbers are equal (or in the rare case both filenames don't have numbers), sort by the full filename to maintain consistency
                return a.name.localeCompare(b.name);
            });

            pages.set(images);

        } else {
            console.log('Error fetching chapters: ' + error);
        }
    }



    async function fetchScrolls(){

        const { data: d, error } = await supabaseClient
            .storage
            .from('img')
            .list(data.n + '/B', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (!error){

            const images = d.map(file => {
                const { data, error: urlError } = supabaseClient
                    .storage
                    .from('img')
                    .getPublicUrl(n + `/B/${file.name}`);

                if (urlError) {
                    console.error('Error getting public URL:', urlError);
                    return null;
                }

                return { ...file, url: data.publicUrl }; // Note the lowercase 'u' in 'publicUrl'
            }).filter(Boolean); // Filter out any null values


            images.sort((a, b) => {
                // Regular expression to extract the trailing number from filenames
                const regex = /(\d+)(?!.*\d)/;
                const matchA = a.name.match(regex);
                const matchB = b.name.match(regex);

                // Convert matches to numbers; if no number is found, use -1 to sort these items first
                const numA = matchA ? parseInt(matchA[0], 10) : -1;
                const numB = matchB ? parseInt(matchB[0], 10) : -1;

                // Compare the numbers for sorting
                if (numA < numB) return -1;
                if (numA > numB) return 1;

                // If numbers are equal (or in the rare case both filenames don't have numbers), sort by the full filename to maintain consistency
                return a.name.localeCompare(b.name);
            });

            scrolls.set(images);

        } else {
            console.log('Error fetching scrolls: ' + error);
        }
    }





    let imagesContainer;
    let images = []; // This will hold references to the image DOM elements

    // Function to scroll to the correct image
    /*
    function scrollToImage() {
        const index = Math.min(Math.max(pageNumber - 1, 0), $pages.length - 1); // Ensure the index is within bounds
        const imageToScrollTo = images[index];
        if (imageToScrollTo) {
            imagesContainer.scrollLeft = imageToScrollTo.offsetLeft - imagesContainer.offsetLeft;
        }
    }
    */

    // Watch for changes on pageNumber and scroll accordingly
    $: pageNumber, scrollToImage();



    ///


    let highlightedPages = [1, 2]; // Default highlighted pages

    // Function to update highlighted pages and scroll into view
    function updateHighlightedPages(newHighlight) {
        highlightedPages = newHighlight;
        scrollToImage();
    }

    // Function to scroll to the highlighted images

    function adjustContainerPadding() {
        if (images.length < 2) {
            console.error('Not enough images to calculate padding.');
            return;
        }

        // Wait for the next tick to ensure images are rendered
        setTimeout(() => {
            if (window.innerWidth > 800){

                const firstTwoImagesWidth = images[1].offsetLeft + images[1].offsetWidth - images[0].offsetLeft;
                const lastTwoImagesWidth = images[images.length - 1].offsetLeft + images[images.length - 1].offsetWidth - images[images.length - 2].offsetLeft;
                const maxWidth = Math.max(firstTwoImagesWidth, lastTwoImagesWidth);

                // Calculate the required padding to center the two images
                const padding = (imagesContainer.offsetWidth - maxWidth) / 2;

                // Apply the calculated padding to the container

                imagesContainer.style.paddingLeft = `${padding}px`;
                imagesContainer.style.paddingRight = `${padding}px`;
            }else{
                imagesContainer.style.paddingLeft = `0`;
                imagesContainer.style.paddingRight = '0'
            }


        }, 0);
    }


    function scrollToImage() {
        if (!imagesContainer || images.length < 2) {
            console.error('Images container or images not ready');
            return;
        }

        const firstImage = images[highlightedPages[0] - 1];
        const secondImage = images[highlightedPages[1] - 1];

        if (!firstImage || !secondImage) {
            console.error('Highlighted images not found');
            return;
        }

        // Apply dynamic padding
        const applyDynamicPadding = () => {
            const containerWidth = imagesContainer.offsetWidth;
            const totalImagesWidth = secondImage.offsetLeft + secondImage.offsetWidth - firstImage.offsetLeft;
            const sidePadding = Math.max((containerWidth - totalImagesWidth) / 2, 0);

            imagesContainer.style.paddingLeft = highlightedPages[0] === 1 ? `${sidePadding}px` : '0';
            imagesContainer.style.paddingRight = highlightedPages[1] === images.length ? `${sidePadding}px` : '0';
        };

        applyDynamicPadding();

        // Calculate the target scroll position
        const targetScrollPosition = firstImage.offsetLeft + (secondImage.offsetLeft + secondImage.offsetWidth - firstImage.offsetLeft) / 2 - imagesContainer.offsetWidth / 2;

        // Smoothly scroll to the target position
        smoothScrollTo(imagesContainer, targetScrollPosition, 500); // 500ms duration
    }

    function smoothScrollTo(element, target, duration) {
        const start = element.scrollLeft;
        const change = target - start;
        let currentTime = 0;
        const increment = 20;

        const animateScroll = function() {
            currentTime += increment;
            const val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };

        animateScroll();
    }

    // 'easeInOutQuad' function for smooth animation
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };



    function updateHighlightedPagesOnScroll() {
        const scrollLeft = imagesContainer.scrollLeft + imagesContainer.offsetWidth / 2;
        let closestIndex = 0;
        let smallestDiff = Infinity;

        images.forEach((img, index) => {
            const imgMidpoint = img.offsetLeft + (img.offsetWidth / 2);
            const diff = Math.abs(scrollLeft - imgMidpoint);
            if (diff < smallestDiff) {
                closestIndex = index;
                smallestDiff = diff;
            }
        });

        highlightedPages = [closestIndex + 1, Math.min(closestIndex + 2, images.length)];
    }



    // Navigate forward
    function goForward() {
        const newHighlight = [highlightedPages[0] + 2, highlightedPages[1] + 2].map(n => Math.min(n, $pages.length));
        updateHighlightedPages(newHighlight);
    }

    // Navigate backward
    function goBackward() {
        const newHighlight = [highlightedPages[0] - 2, highlightedPages[1] - 2].map(n => Math.max(n, 1));
        updateHighlightedPages(newHighlight);
    }

    // Reactive statement to disable/enable buttons based on highlighted pages
    $: isBackwardDisabled = highlightedPages[0] <= 1;
    $: isForwardDisabled = highlightedPages[1] >= $pages.length;


    ///

    function debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    let currentScrollPercentage = 0;

    function handleResize() {
        const isAbove800 = window.innerWidth > 800;
        if (isAbove800 !== wasAbove800) {
            // Preserve relative scroll position across modes
            const oldScrollPosition = currentScrollPercentage * imagesContainer.scrollWidth;

            mode = isAbove800 ? 'G' : 'S';
            wasAbove800 = isAbove800;

            // Apply the relative scroll position in the new mode
            requestAnimationFrame(() => {
                const newScrollPosition = currentScrollPercentage * imagesContainer.scrollWidth;
                imagesContainer.scrollLeft = newScrollPosition;

                if (mode === 'G') {
                    // Additional adjustment for Gallery mode
                    adjustScrollForGalleryMode();
                }
            });
        }
    }

    function updateCurrentScroll() {
        currentScrollPercentage = imagesContainer.scrollLeft / imagesContainer.scrollWidth;
    }

    function adjustScrollForGalleryMode() {
        // Calculate the center of the viewport relative to the imagesContainer
        const viewportCenter = (imagesContainer.scrollLeft + (window.innerWidth / 2)) - imagesContainer.offsetLeft;

        // Find the two pages closest to the viewport center
        let closestPairCenter = Infinity;
        let targetScrollLeft = 0;

        for (let i = 0; i < images.length - 1; i++) {
            const firstImageCenter = images[i].offsetLeft + (images[i].offsetWidth / 2);
            const secondImageCenter = images[i + 1].offsetLeft + (images[i + 1].offsetWidth / 2);
            const pairCenter = (firstImageCenter + secondImageCenter) / 2;

            if (Math.abs(pairCenter - viewportCenter) < Math.abs(closestPairCenter - viewportCenter)) {
                closestPairCenter = pairCenter;
                // Calculate new scroll position to center this pair
                targetScrollLeft = pairCenter - (window.innerWidth / 2);
            }
        }

        // Adjust scroll position to center the closest pair
        imagesContainer.scrollLeft = targetScrollLeft;
    }

    // Call updateCurrentScroll on scroll events



    onMount(()=> {

        fetchScrolls()
        fetchImages()

        wasAbove800 = window.innerWidth > 800;

        highlightedPages = [1, 2]; // Example, adjust based on your logic
        scrollToImage()

        const debounceScroll = debounce(updateHighlightedPagesOnScroll, 200);
        imagesContainer.addEventListener('scroll', debounceScroll);

        imagesContainer.addEventListener('scroll', updateCurrentScroll);

        window.addEventListener('resize', adjustContainerPadding);
        window.addEventListener('resize', handleResize);

        setTimeout(() => {
            adjustContainerPadding()
        }, 500);

        setMode('G')

        $: {
            const screenWidth = window.innerWidth;
            mode = screenWidth > 800 ? 'G' : 'S'
        }
    })


</script>

<div id = 'navbar'>


    <!--
    <select bind:value={mode} on:change="{() => changeMode(mode)}">
        <option value="G"> Page </option>
        <option value="S"> Scroll </option>
    </select>
    -->


    <div id = 'menu'>
        O
    </div>


    <div id = 'mast'>
        <h3> ❮ </h3>
        <h3> Chapter {data.n}: </h3>
        <h2> {data.title} </h2>
        <h3> ❯ </h3>
    </div>

    <div class="toggle-container">
        <div class="labels">
            <span class={mode === 'G' ? 'active' : ''} on:click={() => setMode('G')}>Page</span>
            <span class={mode === 'S' ? 'active' : ''} on:click={() => setMode('S')}>Scroll</span>
        </div>
        <div class="highlight" bind:this={highlight}></div>
    </div>


    <!--
    <div id='nav'>
        <input id='page' type='number' bind:value="{pageNumber}">
        <button on:click={scrollToImage}> Go to Page </button>
    </div>
    -->


</div>



<div id='main' bind:this={imagesContainer}>
    {#if mode === 'G'}

        {#each $pages as page, index (page.id)}
            <img src={page.url} alt="image {index + 1}" loading="lazy" bind:this={images[index]}
                class:highlighted={highlightedPages.includes(index + 1)}
                style="opacity: {highlightedPages.includes(index + 1) ? 1 : 0.1};">
        {/each}

        <button id = 'prev' class = 'navbtn' on:click={goBackward} disabled={isBackwardDisabled}>

            <svg width="130" height="220" viewBox="0 0 130 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M98.9417 2.05459C100.821 0.0310385 103.984 -0.0861327 106.008 1.79288L127.992 22.2064C130.015 24.0854 130.132 27.2491 128.253 29.2726L56.4519 106.597C54.6705 108.516 54.6705 111.484 56.4519 113.402L128.253 190.727C130.132 192.75 130.015 195.914 127.992 197.793L106.008 218.206C103.984 220.085 100.821 219.968 98.9417 217.945L1.86627 113.402C0.0848921 111.483 0.0848883 108.516 1.86627 106.597L98.9417 2.05459Z" fill="black"/>
            </svg>
         </button>
        <button id = 'next' class = 'navbtn' on:click={goForward} disabled={isForwardDisabled}>
            <svg width="130" height="220" viewBox="0 0 130 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M98.9417 2.05459C100.821 0.0310385 103.984 -0.0861327 106.008 1.79288L127.992 22.2064C130.015 24.0854 130.132 27.2491 128.253 29.2726L56.4519 106.597C54.6705 108.516 54.6705 111.484 56.4519 113.402L128.253 190.727C130.132 192.75 130.015 195.914 127.992 197.793L106.008 218.206C103.984 220.085 100.821 219.968 98.9417 217.945L1.86627 113.402C0.0848921 111.483 0.0848883 108.516 1.86627 106.597L98.9417 2.05459Z" fill="black"/>
            </svg>
        </button>


    {:else if mode === 'P'}

        <button on:click="{() => pageNumber = Math.max(pageNumber - 1, 1)}">Previous</button>

        {#each $pages.slice(pageNumber - 1, pageNumber + 1) as page, index}
            <img src={page.url} alt="image" loading="lazy">
        {/each}

        <button on:click="{() => pageNumber = Math.min(pageNumber + 1, $pages.length)}">Next</button>

    {:else if mode === 'S'}

        <div id = 'scroll'>
            {#each $scrolls as scroll, index}
                <img src={scroll.url} alt="scroll" loading="lazy">
            {/each}
        </div>

    {/if}
</div>

<div id = 'mobile'>
    <h3> Chapter {data.n}: </h3>
    <h2> {data.title} </h2>
</div>


<!--

<div id='main' bind:this={imagesContainer}>
    {#each $pages as page, index}
        <img src={page.url} alt="image" loading="lazy" bind:this={images[index]}>
    {/each}
</div>
-->




<style lang='scss'>

select{
    width: 150px;
    option{
        color: black !important;
    }
}


.highlighted {
    opacity: 1 !important;
    background: white;
    box-shadow: 30px 10px 100px rgba(black, 0.1);
}


#prev{
    position: absolute;
    top: calc(50vh);
    left: 30px;
    padding: 20px 18px 20px 15px;
}

#next{
    position: absolute;
    top: calc(50vh);
    right: 30px;
    padding: 20px 15px 20px 18px;
    svg{
        transform: rotate(180deg);
    }
}

.navbtn{
    background: rgba(white, 0.6);
    color: black;
    font-size: 32px;
    border-radius: 50px;


    svg{
        height: 24px;
        width: 18px;
    }


    &:hover{
        cursor: pointer !important;
        background: white;
    }
}

#main{
    height: calc(100vh - 44px);
    width: 100vw;
    overflow-y: scroll;
    display: flex;
    gap: 0px;
    align-items: center;
    box-sizing: border-box;
    padding: 0;
    margin: 0;

    img{
        height: calc(100vh - 54px);
        //box-shadow: 0 15px 30px rgba(black, 0.25);
        flex-shrink: 0 !important;
        transition: opacity 0.3s ease;
        //border: 0.5px solid rgba(black, 0.2);
    }

    #scroll{
        display: flex;
        flex-direction: column;
        align-items: center;
        height: calc(100vh - 44px);
        width: 100vw !important;
        overflow-y: scroll;

        //background: rgba(black, 0.02);
        padding: 0;
        margin: 0;

        img{
            width: 100%;
            //max-width: 600px;
            height: auto;
            box-shadow: none;
            border-radius: 0;
            box-shadow: 0 50px 80px rgba(black, 0.05);

        }
    }
}

#navbar{
    width: 100vw;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: rgba(black, 0);


    //background: black;

    #mast{
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0 5px;

        h3{
            color: rgba(black, 0.4);
            font-size: 14px;
            letter-spacing: -0.25px;
        }

        h2{
            font-size: 14px;
            font-weight: 600;
        }
    }

    .toggle-container {
        position: relative;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: rgba(black, 0.1);
        border-radius: 20px;
        padding: 5px;
        cursor: pointer;
        user-select: none;
        width: 120px; /* Adjust based on your needs */
    }

    .labels {
        display: flex;
        width: 100%;
        justify-content: space-around;
        z-index: 4;
        gap: 0;

        letter-spacing: -0.1px;
        cursor: pointer !important;
    }

    .labels span {
        transition: opacity 0.3s ease;
        opacity: 0.5;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer !important;
    }

    .labels span.active {
        opacity: 1;
    }

    .highlight {
        position: absolute;
        background-color: white;
        border-radius: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 8px rgba(black, 0.15), inset 0 -2px 4px rgba(black, 0.05);

    }
}

#mobile{
    display: none;
}

select{
    background: rgba(black, 0.1) !important;
    outline: none !important;
    border: none !important;
    font-size: 14px;
    padding: 5px 15px;
    border-radius: 50px;
    width: 100px;
    transition: 0.2s ease;

    &:hover{
        background: rgba(black, 0.2) !important;
    }

    &:focus{
        outline: none !important;
        border: none !important;
    }
}

::-webkit-scrollbar{
    height: 10px;
    width: 0;
    background: black;
}

::-webkit-scrollbar-thumb{
    background: rgba(white, 0.5);
    border-radius: 1px;
    transition: 0.2s ease !important;

    &:hover{
        background: rgba(white, 0.7);
    }
}

#nav{
    display: flex;
    gap: 5px;
    background: rgba(black, 0.1);
    border-radius: 50px;

    input{

        font-size: 12.5px;
        padding: 5px 15px;
        border-radius: 50px;

        width: 60px;
        height: 32px;
        //transform: translateX(30px);


        &:focus{
            outline: none !important;
            border: none !important;
        }
    }

    button{
        border-radius: 50px;
        font-size: 12.5px;
        font-weight: 600;
        height: 32px;
        width: 96px;
        cursor: pointer !important;
        background: #e50000;
        box-shadow: none;
        z-index: 3;
        letter-spacing: -0.2px;
        &:hover{
            background: #bd0000;
        }
    }
}


@media screen and (max-width: 800px){

    #navbar{
        display: flex;
        justify-content: center;


        #mast{
            background: white;
            z-index: 5 !important;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 16px;
            box-shadow: 0 10px 25px rgba(black, 0.1), inset 0 -2px 4px rgba(black, 0.05);
        }

    }

    #main{
        transform: translateY(-44px);
        height: 100vh;
        z-index: -2 !important;

        #scroll{
            height: 100vh;
        }
    }

    #menu{
        display: none !important;
    }

    .toggle-container{
        display: none !important;
    }

}


</style>