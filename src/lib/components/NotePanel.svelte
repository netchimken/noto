<script lang="ts">
  import type { APIClient } from '$lib/api/client';
  import { formatDate } from '$lib/util/date';
  import type { ArrayType } from '$lib/util/helpers';
  import type { InferResponseType } from 'hono';
  import { Marked } from 'marked';
  import sanitize from 'sanitize-html';

  interface Props {
    note: ArrayType<InferResponseType<APIClient['note']['list']['$post']>['notes']>
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
  class="w-full flex flex-row justify-between items-center group"
  href={"/" + note.id}
>
  <div class="w-[90%] flex flex-col">
    <p class="markdown w-full pr-6 group-hover:underline text-ellipsis overflow-hidden whitespace-nowrap">
      {@html note.title ? parseTitle(note.title) : date}
    </p>
    
    {#if showName || note.title}
      <p class="text-xs text-muted">
        {#if showName}{note.author.name}{/if}
        {#if note.title}&lpar;{date}&rpar;{/if}
      </p>
    {/if}
  </div>

  <div class="w-fit text-right">
    <p class="text-muted">#{note.id}</p>

    {#if showTags && note.tags.length > 0}
      <p class="text-xs text-muted text-nowrap overflow-hidden text-ellipsis">
        #{note.tags.filter(t => !t.startsWith('~'))[0]}
      </p>
    {/if}
  </div>
</a>