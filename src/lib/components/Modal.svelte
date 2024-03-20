<script>
     import { fly } from 'svelte/transition';
    export let showModal = false;
    export let title = '';
    export let close = () => {};

 </script>

  <div class="modal" class:show={showModal} in:fly="{{ y: 200, duration: 500 }}">
    <div class="modal-content"  transition:fly="{{ y: 200, duration: 500 }}">
      <h2>{title}</h2>
      <button on:click={close}>X</button>
      <slot></slot>
    </div>
  </div>

  <style>
    .modal {
      display: none;
      position: fixed;
      z-index: 5;
      padding-top: 100px;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.4);
    }

    .modal-content {
      background-color: #fefefe;
      margin: auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
    }

    .show {
      display: block;
    }

    button {
      float: right;
      border: none;
      background: transparent;
    }
  </style>