<script>
    export let onUndo;
  </script>

  <div class="dialog">
    <p>Task deleted. Undo?</p>
    <button on:click={() => onUndo()}>Undo</button>
  </div>

  <style>
    .dialog {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: white;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 5px;
      display: flex;
      gap: 10px;
    }
  </style>