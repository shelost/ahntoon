<script>
  import SpacePage from '$lib/components/SpacePage.svelte'
  import { supabaseClient } from '$lib/db'
  export let data


console.log(data)
</script>
<SpacePage {data} page = {true}/>