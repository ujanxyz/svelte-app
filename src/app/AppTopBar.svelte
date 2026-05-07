<script lang="ts">
import AppThemeSwitchButton from "@/features/app-settings/AppThemeSwitchButton.svelte";
import { getAppIcon } from "@/utils/appIcons";

const LogoIcon = getAppIcon("shapes");
</script>

<header class="app-topbar" role="banner">
  <div class="brand">
    <LogoIcon size={18} />
    <h1 class="title">Svelte App Shell</h1>
  </div>

  <div class="actions" aria-label="App actions">
    <AppThemeSwitchButton />
  </div>
</header>

<style>
.app-topbar {
  height: 3rem;
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--color-border-subtle);
  background: var(--color-bg-1);
  color: var(--color-text-hi-con);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
}
</style>
