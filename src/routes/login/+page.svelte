<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { initAPI } from '$lib/api/client';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import CodeInput from '$lib/components/CodeInput.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { app, AppDataSchema } from '$lib/util/app.svelte';
  import { clientEnv } from '$lib/util/env';

  const api = initAPI(fetch);

  let fetching = $state(false);
  let verifying = $state(false);
  let error = $state<string | null>(null);

  let email = $state(page.url.searchParams.get('email'));
  let validation = $state<string | null>(null);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - login</title>
</svelte:head>

<Navbar>
  <Actionbar actions={[
    { name: "home", href: '/' }
  ]} />
</Navbar>

<div class="pt-[25vh] space-y-6 flex flex-col items-center text-center">
  {#if !verifying}
  
    <h3 class="text-2xl font-semibold">Login</h3>
    <form class="contents space-y-6" onformdata={async (e) => {
      const login = e.formData.get('email');
      if (!login || typeof login !== 'string') return;

      // disable inputs
      fetching = true;
      error = null;

      // store email
      email = login;

      const res = await api.auth.login.$post({ query: { email } });
      if (!res.ok) 
        error = await res.text();
      else {
        validation = (await res.json()).validation;
        verifying = true;
      }

      // enable inputs
      fetching = false;
    }}>
      <input 
        class="w-xs disabled:text-disabled" 
        type="email" 
        placeholder="email" 
        name="email" 
        disabled={fetching} 
        value={email}
        required  
      />
      <p class="text-danger text-sm" hidden={!!!error}>{error}</p>
      <fieldset>&lsqb; <button class="disabled:text-disabled" type="submit" disabled={fetching}>continue</button> &rsqb;</fieldset>
    </form>

  {:else}

    <h3 class="text-2xl font-semibold">Verification</h3>
    <p>An email was sent to <span class="text-muted">{email}</span></p>
    <form class="contents space-y-6" onformdata={async (e) => {
      const code = e.formData.get('code');
      if (!code || typeof code !== 'string' || !validation) return;
      
      fetching = true;
      error = null;

      const res = await api.auth.verify.$post({ query: { code, validation } });
      if (!res.ok)
        error = await res.text();
      else {
        const data = await res.json();
        
        app.author = AppDataSchema.shape.author.parse(data.author);

        goto('/compose', { replaceState: true });
      }

      fetching = false;
    }}>
      <CodeInput digits={6} name="code" disabled={fetching} />
      <fieldset>&lsqb; <button class="disabled:text-disabled" type="submit" disabled={fetching}>verify</button> &rsqb;</fieldset>
      <p class="text-danger">{error}</p>
    </form>

  {/if}
</div>