<script>
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      console.log('页面变为可见');
    } else {
      console.log('页面变为隐藏');
    }
  }
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />