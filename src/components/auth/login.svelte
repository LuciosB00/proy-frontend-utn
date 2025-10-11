<script lang="ts">
    import { http } from "@src/core/http";
    import type { AuthResponse } from "@src/interfaces/user.interface";

    import { jwtDecode } from "jwt-decode";

    let email: string = "";
    let password: string = "";
    let error: string = "";
    let loading: boolean = false;
    let passwordError: string = "";
    let emailError: string = "";

    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password: string): boolean {
        return password.length >= 6 && password.length <= 20;
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
            passwordError = "La contraseña debe ser entre 6 y 20 caracteres";
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
            const user = await http.post<AuthResponse>(
                `${import.meta.env.PUBLIC_BACKEND_API}/auth/login`,
                {
                    email,
                    password,
                },
               
            );

            

            if (user) {
                const jwtData = jwtDecode<{
                    id: string;
                    iat: number;
                    exp: number;
                }>(user?.token);

                const maxAge = jwtData?.exp - jwtData?.iat;

                document.cookie = `token=${user?.token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;

                delete user?.token;

                localStorage.setItem("user", JSON.stringify(user));

                location.replace("/");
            }
        } catch (err: any) {
            error = err?.message;
            console.log(error);
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
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="email" class="sr-only">Email</label>
                    <input
                        bind:value={email}
                        id="email"
                        name="email"
                        type="email"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email"
                    />
                    {#if emailError}
                        <p class="text-red-500 text-xs mt-1">{emailError}</p>
                    {/if}
                </div>
                <div>
                    <label for="password" class="sr-only">Contraseña</label>
                    <input
                        bind:value={password}
                        id="password"
                        name="password"
                        type="password"
                        required
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Contraseña"
                    />
                    {#if passwordError}
                        <p class="text-red-500 text-xs mt-1">{passwordError}</p>
                    {/if}
                </div>
            </div>

            {#if error}
                <div class="text-center text-red-500 text-sm">{error}</div>
            {/if}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
            </div>
        </form>
    </div>
</div>
