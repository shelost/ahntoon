<script>
    import { onMount } from 'svelte';
    import { navigating } from '$app/stores';
    import { loading } from '$lib/stores';

    onMount(() => {
      const unsubscribeNavigating = navigating.subscribe((value) => {
        loading.set(value); // Update the 'loading' store based on the 'navigating' store value
      });

      return () => {
        unsubscribeNavigating();
      };
    });
  </script>

  <!-- Empty template, as this component only handles the logic -->