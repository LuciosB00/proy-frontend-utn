<script lang="ts">
  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: SelectOption[];
    value?: string | null;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    containerClass?: string;
    inputClass?: string;
    dropdownClass?: string;
    optionClass?: string;
    selectedOptionClass?: string;
    disabledOptionClass?: string;
    onValueChange?: (value: string | number | null) => void;
  }

  let {
    options = [],
    value = $bindable(''),
    placeholder,
    searchPlaceholder,
    disabled = false,
    clearable = true,
    containerClass = '',
    inputClass = '',
    dropdownClass = '',
    optionClass = '',
    selectedOptionClass = '',
    disabledOptionClass = '',
    onValueChange,
  }: Props = $props();

  let isOpen = $state(false);
  let searchTerm = $state('');
  let inputElement = $state<HTMLInputElement>();

  let filteredOptions = $derived(
    !searchTerm ? options : options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const selectedOption = $derived((): SelectOption | null => {
    return options.find((option) => option.value === value) || null;
  });

  $effect(() => {
    if (onValueChange) {
      onValueChange(value);
    }
  });

  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => inputElement?.focus(), 0);
    }
  }

  function selectOption(option: SelectOption) {
    if (option.disabled) return;
    value = option.value;
    isOpen = false;
    searchTerm = '';
  }

  function clearValue() {
    if (disabled) return;
    value = '';
    isOpen = false;
    searchTerm = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false;
      searchTerm = '';
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.filterable-select')) {
      isOpen = false;
      searchTerm = '';
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<style>
  .noselect {
    user-select: none;
  }
</style>

<div class="filterable-select relative {containerClass}" class:opacity-50={disabled}>
  <div
    class="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 {inputClass}"
    class:cursor-not-allowed={disabled}
    onclick={toggleDropdown}
    role="button"
    tabindex={disabled ? -1 : 0}
    onkeydown={(e) => e.key === 'Enter' && toggleDropdown()}
  >
    {#if isOpen}
      <input
        bind:this={inputElement}
        bind:value={searchTerm}
        placeholder={searchPlaceholder}
        class="flex-1 outline-none bg-transparent"
        onkeydown={handleKeydown}
        {disabled}
      />
    {:else}
      <span class="flex-1 text-gray-900 noselect pointer-events-none">
        {selectedOption()?.label || value || placeholder}
      </span>
    {/if}

    <div class="flex items-center space-x-2">
      {#if clearable && value != null && value !== '' && !disabled}
        <button
          aria-label="Clear"
          type="button"
          class="text-gray-400 hover:text-gray-600 p-1"
          onclick={(e) => {
            e.stopPropagation();
            clearValue();
          }}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}

      <svg
        class="w-5 h-5 text-gray-400 transition-transform duration-200"
        class:rotate-180={isOpen}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {#if isOpen}
    <ul
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto {dropdownClass}"
    >
      {#if filteredOptions.length === 0}
        <li class="px-3 py-2 text-gray-500 text-sm">No hay coincidencias</li>
      {:else}
        {#each filteredOptions as option (option.value)}
          <li>
            <button
              type="button"
              class="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm {optionClass} {disabledOptionClass} {selectedOptionClass}"
              class:bg-blue-50={option.value === value}
              class:text-blue-600={option.value === value}
              class:cursor-not-allowed={option.disabled}
              class:opacity-50={option.disabled}
              class:hover:bg-gray-100={!option.disabled}
              onclick={() => selectOption(option)}
            >
              {option.label}
            </button>
          </li>
        {/each}
      {/if}
    </ul>
  {/if}
</div>