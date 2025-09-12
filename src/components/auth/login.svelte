<script lang="ts">
    import { jwtDecode } from "jwt-decode";

    let email: string = "";
    let password: string = "";
    let error: string = "";
    let loading: boolean = false;
    let passwordError: string = "";
    let emailError: string = "";

    interface User {
        id: number;
        email: string;
        name: string;
        token?: string;
        deletedAt: Date | null;
    }

    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password: string): boolean {
        return password.length >= 8 && password.length <= 20;
    }

    function validateForm(): boolean {
        let isValid = true;
        emailError = "";
        passwordError = "";

        if (!validateEmail(email)) {
            emailError = "Por favor ingrese un email válido";
            isValid = false;
        }

        if (!validatePassword(password)) {
            passwordError = "La contraseña debe ser entre 8 y 20 caracteres";
            isValid = false;
        }

        return isValid;
    }

    async function handleLogin(e: Event) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        error = "";
        loading = true;

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    error = "El email no existe";
                } else if (response.status === 401) {
                    error = "Contraseña incorrecta";
                } else {
                    error = data.message || "Error al iniciar sesión";
                }
                return;
            }

            const user: User = {
                id: data.id,
                email: data.email,
                name: data.name,
                deletedAt: data.deletedAt,
            };

            const jwtData = jwtDecode<{
                id: string;
                iat: number;
                exp: number;
            }>(data.token);

            const maxAge = jwtData?.exp - jwtData?.iat;
            document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;

            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = "/";
        } catch (err) {
            error = "Error al conectar con el servidor";
            console.error(err);
        } finally {
            loading = false;
        }
    }
</script>

<div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
>
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Iniciar Sesión
            </h2>
        </div>
        <form class="mt-8 space-y-6" onsubmit={handleLogin}>
            {#if error}
                <div class="rounded-md bg-red-50 p-4">
                    <div class="flex">
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                {error}
                            </h3>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="email" class="sr-only">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm {emailError
                            ? 'border-red-500'
                            : ''}"
                        placeholder="Email"
                        bind:value={email}
                    />
                    {#if emailError}
                        <p class="mt-1 text-sm text-red-600">{emailError}</p>
                    {/if}
                </div>
                <div>
                    <label for="password" class="sr-only">Contraseña</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm {passwordError
                            ? 'border-red-500'
                            : ''}"
                        placeholder="Contraseña"
                        bind:value={password}
                    />
                    {#if passwordError}
                        <p class="mt-1 text-sm text-red-600">{passwordError}</p>
                    {/if}
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if loading}
                        <span
                            class="absolute left-0 inset-y-0 flex items-center pl-3"
                        >
                            <svg
                                class="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                ></circle>
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </span>
                        Iniciando sesión...
                    {:else}
                        Iniciar Sesión
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
