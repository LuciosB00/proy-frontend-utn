<script lang="ts">
    import { PATHS } from "@core/config";
    import { Role, type User } from "@src/interfaces/user.interface";
    import { onMount } from "svelte";

    let user = $state(null)

    onMount(async () => {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    });
</script>

<nav class="w-full bg-gray-800 p-2 mb-2">
    <ul class="w-full flex gap-4 p-2">
        {#if user}
        <li>
            <a
                class="text-white font-bold hover:text-accent"
                href="/portal"
            >
                Portal
            </a>
        </li>
        {/if}

        {#each PATHS.filter((path) => !path.public) as path}
            {#if path.role.includes(user?.role)}
            <li>
                <a
                    class="text-white font-bold hover:text-accent"
                    href={path.path}
                >
                    {path.name}
                </a>
            </li>
            {/if}
            {#if path.role.includes(user?.role)}
            <li>
                <a
                    class="text-white font-bold hover:text-accent"
                    href={path.path}
                >
                    {path.name}
                </a>
            </li>
            {/if}
        {/each}
    </ul>
</nav>
