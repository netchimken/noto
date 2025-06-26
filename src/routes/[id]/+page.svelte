<script lang="ts">
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Markdown from '$lib/components/Markdown.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from "$lib/util/app";
  import moment from "moment";

  const app = getApp();

  let { data } = $props();
  let { note } = data;

  let author = $derived(app().author);
</script>

<Navbar
  title={note?.authorName ?? "<unknown>"}
  href={note ? "/~" + note.authorName : undefined}
>
  <p class="text-xs text-muted">
    &lpar;{moment(note.updatedAt ?? note.createdAt).format(
      "MMM Do YYYY, h:mma",
    )}&rpar;
  </p>

  {#if author}
    <Actionbar
      actions={note && note.authorName === author.name
        ? [
            { name: "edit", href: '/' + note.id + '/edit' },
            { name: "delete", func() {} },
          ]
        : [{ name: "me", href: "/~" + author.name }]}
    />
  {/if}
</Navbar>

<Markdown class="max-w-[560px] w-[100%]" content={note.content} />