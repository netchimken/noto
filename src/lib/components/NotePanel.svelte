<script lang="ts">
  import type { ClientNote } from '$lib/api/util/parsers';
  import { formatDate } from '$lib/util/date';
  import type { Needy } from '$lib/util/helpers';
  import { Marked } from 'marked';
  import sanitize from 'sanitize-html';

  interface Props {
    note: Needy<ClientNote, 'createdAt' | 'tags' | 'author.id' | 'author.name'>
    showName?: boolean
    showTags?: boolean
  }

  let { note, showName, showTags }: Props = $props();
  let date = $derived(formatDate(note.createdAt));

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

<a
  class="w-full flex flex-col justify-between items-center group"
  href={"/" + note.id}
>
  <div class="w-full flex flex-row justify-between items-center">
    <p class="w-fit markdown pr-6 group-hover:underline text-ellipsis text-nowrap overflow-hidden">
      {@html note.title ? parseTitle(note.title) : date}
    </p>
    
    <p class="text-muted">#{note.id}</p>
  </div>

  <div class="w-full flex flex-row justify-between items-center text-right space-x-5">
    {#if showName || note.title}
      <p class="w-full text-xs text-muted text-left text-nowrap">
        {#if showName}{note.author.name}{/if}
        {#if note.title}&lpar;{date}&rpar;{/if}
      </p>
    {/if}

    {#if showTags && note.tags.length > 0}
      <p class="w-full text-xs text-muted text-right text-ellipsis text-nowrap overflow-hidden">
        #{note.tags.filter(t => !t.startsWith('~'))[0]}
      </p>
    {/if}
  </div>
</a>