<script lang="ts">
  import { goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from '$lib/util/app';
  import { clientEnv } from '$lib/util/env';

  const api = initAPI(fetch);
  const app = getApp();
  let author = $derived(app().author);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - settings</title>
</svelte:head>

{#if author}
  <Navbar title={author.name} href={'/~' + author.name}>
    <Actionbar 
      actions={[
        { name: "me", href: '/~' + author.name },
        { name: "compose", href: '/compose' }
      ]}
    />
  </Navbar>
  
  <div class="max-w-[500px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
    <div class="w-full flex flex-row justify-between items-center">
      <h1 class="text-lg font-semibold">Account</h1>
      <div class="text-sm">
        <!-- <button>[ edit name ]</button> -->
        <button
          onclick={async () => {
            const yes = confirm("this action will log you out on all devices");

            if (yes) {
              const res = await api.auth.logout.$delete();
              if (!res.ok) return alert(`${res.status} - ${res.statusText}`);

              app().author = null;
              goto('/');
            }
          }}
        >[ logout ]</button>
      </div>
    </div>
  </div>
{/if}