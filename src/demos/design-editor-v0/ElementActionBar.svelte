<script lang="ts">
import { getAppIcon } from "@/utils/appIcons";

type ActionName = "plus" | "trash" | "info" | "wrench";

type Props = {
  coordinate: {
    left: number;
    top: number;
  };
  onaction?: (action: ActionName) => void;
};

const {
  coordinate,
  onaction,
}: Props = $props();

const PlusIcon = getAppIcon("plus");
const TrashIcon = getAppIcon("trash");
const InfoIcon = getAppIcon("info");
const WrenchIcon = getAppIcon("wrench");

function onActionClick(action: ActionName): void {
  onaction?.(action);
}
</script>

<div
  class="transform-action-bar"
  style={`left: ${coordinate.left}px; top: ${coordinate.top}px;`}
  aria-label="Transform actions"
>
  <button type="button" class="action-btn" onclick={() => onActionClick("plus")} aria-label="Plus"><PlusIcon size={14} /></button>
  <button type="button" class="action-btn" onclick={() => onActionClick("trash")} aria-label="Trash"><TrashIcon size={14} /></button>
  <button type="button" class="action-btn" onclick={() => onActionClick("info")} aria-label="Info"><InfoIcon size={14} /></button>
  <button type="button" class="action-btn" onclick={() => onActionClick("wrench")} aria-label="Wrench"><WrenchIcon size={14} /></button>
</div>

<style>
.transform-action-bar {
  position: absolute;
  z-index: 6;
  pointer-events: auto;
  transform: translate(-50%, -100%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.18);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(8px);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: #f8fafc;
  color: #334155;
  cursor: pointer;
}

.action-btn:hover {
  background: #eef2ff;
  color: #1e293b;
}
</style>
