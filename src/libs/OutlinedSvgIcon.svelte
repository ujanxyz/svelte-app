<script lang="ts">
    const size = 24;
</script>

<span>
    <svg xmlns="http://www.w3.org/2000/svg" class="ico" viewBox="0 0 {`${size}`} {`${size}`}"
        fill="none" stroke-linecap="round" stroke-linejoin="round" clip-rule="evenodd" >
        <path d="M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0 -20M8 12h8M12 8v8"/>
    </svg>
</span>

<style>
span {
    --icon-btn-icon-sz: 1.2rem;
    --icon-corner-radius: 0.1rem;
    --icon-bg-rgb: 128, 128, 128;

    width: calc(var(--icon-btn-icon-sz) + 2px);
    height: calc(var(--icon-btn-icon-sz) + 2px);
    border-radius: var(--icon-corner-radius);
    background-color: rgba(var(--icon-bg-rgb), 0.2);
    padding: 1px;
    outline: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}
svg.ico {
    width: var(--icon-btn-icon-sz);
    height: var(--icon-btn-icon-sz);
    fill: none;
    overflow-clip-margin: content-box;
    overflow: hidden;
    stroke-opacity: 0.8;
    stroke: currentcolor;
    stroke-width: 0.8;
}
svg.ico:hover {
    stroke: #86ddf5;
    stroke-width: 1.2;
}
</style>