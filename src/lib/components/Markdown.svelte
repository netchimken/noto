<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { marked } from "marked";
  import sanitize from "sanitize-html";
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    content: string
  }

  const { content, class: classes, ...others }: Props = $props();
</script>

<div 
  class={[
    "prose",
    "prose-strong:text-base",
    "prose-headings:text-base",
    "prose-p:text-base prose-p:m-0",
    "prose-a:text-info prose-a:no-underline prose-a:hover:underline",
    "prose-li:text-base",
    classes
  ]}
  
  {...others}
>
  {#await marked(content.replace(/\n(?=\n)/g, "\n<br/>"), { gfm: true }) then markedContent}
    {@html env.PUBLIC_ALLOW_XSS ? markedContent : sanitize(markedContent)}
  {/await}
</div>