<!-- src/App.svelte -->
<script>
    let domainName = '';
    let similarDomains = [];
    let isLoading = false;

    const API_KEY = 'gHpjReJbkLHv_93zo1byvQ3z1XA8b1TggrE';
    const SECRET = 'BSn3qBq3oXEK3Z9bK1BBzH'
    const API_URL = 'https://api.godaddy.com/v1/domains/available';

    const checkDomainAvailability = async () => {
      if (!domainName) return;

      isLoading = true;

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      };

      const body = JSON.stringify({
        domain: domainName,
        suggestions: 10, // Number of similar domain suggestions to request
      });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers,
          body,
        });

        const data = await response.json();

        if (response.ok) {
          similarDomains = [0, data.currency] || [];
        } else {
          console.error('Domain.com API error:', data);
        }
      } catch (error) {
            console.error('Error checking domain availability:', error);
      }

      isLoading = false;
    };
</script>

<main>
    <h1>Domain Name Checker</h1>

    <div>
      <input
        type="text"
        placeholder="Enter a domain name"
        bind:value={domainName}
        on:input={() => {
          similarDomains = [];
          isLoading = false;
        }}
      />

      <button on:click={checkDomainAvailability} disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Check Availability'}
      </button>
    </div>

    {#if similarDomains.length > 0}

      <div>
        <h2>Similar available domains:</h2>
        <ul>
          {#each similarDomains as domain}
            <li>{domain}</li>
          {/each}
        </ul>
      </div>

    {:else}

      <p>No similar available domains found.</p>
    {/if}
</main>

<style>
    main {
      text-align: center;
      padding: 1em;
      max-width: 320px;
      margin: 0 auto;
    }

    input,
    button {
      margin-bottom: 1em;
    }

    ul {
      list-style: none;
      padding: 0;
    }
</style>
