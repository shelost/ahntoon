<script lang="ts">
	import { fade } from 'svelte/transition'
	import { cubicIn, cubicOut } from 'svelte/easing'
	import Navbar from '$lib/components/common/NavBar.svelte'

	export let data
  </script>


  {#key data.pathname}
	<div id = 'app'
	  in:fade={{ easing: cubicOut, duration: 300, delay: 400 }}
	  out:fade={{ easing: cubicIn, duration: 300 }}
	>
	  <slot />
	</div>
  {/key}

<style>


#app{
	height: 100vh;
	overflow-y: scroll;
	background: #101010;
}


</style>