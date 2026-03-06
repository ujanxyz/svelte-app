<script lang="ts">
import type { ClientXY } from "../types";
import useCurrentOverlay from "../useCurrentOverlay";

let clientXY = $state<ClientXY>({x: 0, y: 0});

/**
 * CSS vars controlling the menu position.
 */
const styleString: string = $derived(`--left: ${clientXY.x}px; --top: ${clientXY.y}px;`);

const current = useCurrentOverlay();

$effect.pre(() => {
  const { clientXY: payloadXY } = current.getLayerPayload();
  clientXY = payloadXY;
});

</script>

<div class="layer" style={styleString}>
  Menu content.
</div>

<style>
.layer {
  left: var(--left);
  top: var(--top);
  background-color: gold;
  width: 20%;
  height: 30%;
  min-width: 200px;
  min-height: 150px;
  border-radius: 6px;
  overflow: hidden;
  color: #171717;
  box-shadow: 4px 4px 6px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
  transform: translate(
    calc(-50% + 200px + var(--card-index) * -40px),
    calc(-50% + -300px + var(--card-index) * 60px)
  );
}
</style>
