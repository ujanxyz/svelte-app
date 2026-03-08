<script lang="ts">
import { kDummyToasts } from "../utils/dummyData";
import { makeCircularPicker } from "../utils/random";
import { ToastType } from "./types";
import useToast from "./useToast";

const {showToast} = useToast();

const nextInfoMessage = makeCircularPicker(kDummyToasts.info);
const nextSuccessMessage = makeCircularPicker(kDummyToasts.success);
const nextWarningMessage = makeCircularPicker(kDummyToasts.warning);
const nextErrorMessage = makeCircularPicker(kDummyToasts.error);

function toastInfo() {
  showToast(ToastType.INFO, nextInfoMessage.pick());
}

function toastSuccess() {
  showToast(ToastType.SUCCESS, nextSuccessMessage.pick());
}

function toastWarning() {
  showToast(ToastType.WARNNG, nextWarningMessage.pick());
}

function toastError() {
  showToast(ToastType.ERROR, nextErrorMessage.pick());
}
</script>

<button onclick={toastInfo} class="trigger" style="--toast-color: #2648AA">INFO</button>
<button onclick={toastSuccess} class="trigger" style="--toast-color: #26AA48">SUCCESS</button>
<button onclick={toastWarning} class="trigger" style="--toast-color: #AAA826">WARNNG</button>
<button onclick={toastError} class="trigger" style="--toast-color: #AA4848">ERROR</button>

<style>
button {
  background-color: #aa2626;
}
.trigger {
  background-color: var(--toast-color);
  color: #f0f0f0;
  border-radius: 4px;
  padding: 6px 12px;
  font-weight: 400;
  cursor: pointer;
}
.trigger:not(:last-child) {
  margin-right: 16px;
  font-size: large;
}
</style>