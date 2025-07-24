<script lang="ts">
	import '../app.css';
	import {Header, Modal, PopUpCard} from '$components'
    import { cardState } from '$lib/store/GlobalState';
	let { children } = $props();
</script>
<Header />

<Modal/>
{@render children()}
<PopUpCard x={$cardState.position.x} y={$cardState.position.y + 250} isHovered={$cardState.isHovered}/>