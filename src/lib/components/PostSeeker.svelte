<script lang="ts">
  import { formatDate } from '$lib/util/date';
  import sanitize from 'sanitize-html';
  import NotePanel from './NotePanel.svelte';
  import Paginator from "./Paginator.svelte";
  import { Marked } from 'marked';

  interface Props {
    page: any
    pageNo: number
    showNames?: boolean
    showTags?: boolean
  }

  let { 
    page,
    pageNo = $bindable(1),
    showNames,
    showTags,
  }: Props = $props();

  let pinned = $derived(page.pinned);

  const parseTitle = (title: string) => {
    return sanitize(
      new Marked().parse(title, { async: false }),
      {
        allowedTags: ['span', 'code', 'b', 'i'],
        allowedAttributes: { span: ['style'] },
        allowedStyles: {
          '*': {
            color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
          }
        }
      }
    )
  }
</script>

<div class="max-w-[560px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
  {#if !page}
    <p class="text-muted">loading...</p>
  {:else if page.pages === 0}
    <p class="text-muted">no notes here yet...</p>
  {:else}
    {@const pages = page.pages}
    {@const notes = page.notes}

    {#if pinned}
      {@const date = formatDate(pinned.createdAt)}

      <div class="w-full space-x-1">
        <p class="text-sm text-muted">pinned</p>
        <a
          class="w-full flex flex-row justify-between items-center group"
          href={"/" + pinned.id}
        >
          <p class="markdown w-full group-hover:underline text-ellipsis overflow-hidden whitespace-nowrap">
            {@html pinned.title ? parseTitle(pinned.title) : date}
          </p>
        </a>
      </div>
    {/if}

    <Paginator {pages} bind:page={pageNo} />

    {#each notes as note, i}
      <NotePanel {note} showName={showNames} {showTags} />
    {/each}
  {/if}
</div>
