<script lang="ts">
    import { PATHS } from "@core/config";
</script>

<nav class="w-full bg-gray-800 p-2 mb-2">
    <ul class="w-full flex gap-4 p-2">
        {#each PATHS.filter((path) => path.menu) as path}
            <li>
                <a
                    class="text-white font-bold hover:text-accent"
                    href={path.path}
                >
                    {path.name}
                </a>
            </li>
        {/each}
    </ul>
</nav>
