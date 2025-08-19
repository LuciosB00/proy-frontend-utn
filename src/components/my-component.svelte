<script lang="ts">
    // Your TypeScript code here

    interface Props {
        title: string;
    }

    let { title }: Props = $props();
</script>

<!-- Your HTML here -->

<h1 class="bg-amber-400 text-red-700 font-bold">{title}</h1>
