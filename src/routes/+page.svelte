<script lang="ts">
  import { initAPI } from '$lib/api/client';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from '$lib/util/app';
  import { clientEnv } from '$lib/util/env';

  const api = initAPI(fetch);
  const app = getApp();

  let author = $derived(app().author);
  let email = $state<string | 1 | 0>(0);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND}</title>
</svelte:head>

<Navbar>
  <Actionbar 
    actions={author
      ? [
        { name: "me", href: '/~' + author.name },
        { name: "compose", href: '/compose' }
      ]
      : [{ name: "login", href: '/login' }]
    }
  />
</Navbar>

<div class="pt-[25vh] px-8 space-y-1.5 text-center">
  <h1 class="text-xl">Welcome to <b>Noto</b></h1>
  <p class="text-muted">a semi-private "blogging" site</p>
  <br>
  <p>
    want access?
    {#if email}

      <span class="text-muted">
        {#if email === 1}
          ...
        {:else}
          {email}
        {/if}
      </span>

    {:else}

      <button 
        class="text-info cursor-pointer" 
        title="reveal email"
        onclick={async () => {
          email = 1;
          const res = await api.contact.$get();
          
          if (res.ok) email = (await res.json()).email ?? 0;
          else email = 0;
        }}
      >
        shoot me an email :&rsqb;
      </button>

    {/if}
  </p>
</div>