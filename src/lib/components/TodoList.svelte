<script lang="ts">
    import { supabaseClient } from '$lib/db';
    import { onMount } from 'svelte';
    import { readable, writable } from 'svelte/store';
    import type { PageData, Task } from '../../routes/$types';
    import UndoDialog from './UndoDialog.svelte';
    import Modal from './Modal.svelte';

    export let data: PageData;

    $: ({ user } = data);

    let showModal = false;

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    let userData = {};

    const newTask = writable({
      type: 'task',
      title: '',
      priority: 2,
      space: 'hackerdash-123',
      project: 'svelte-app-1234',
      tags: [],
      completed: false,
      date: new Date().toISOString().split('T')[0], // Set the default date to the current date
    });

    const tasks = writable([]);
    const currentPriority = writable(2);

    const tasksByDate = writable({});

    // Function to group tasks by date
    function groupTasksByDate(tasks) {
      const groupedTasks = {};
      tasks.forEach((task) => {
        if (!task.completed) {
          const date = task.date;
          if (!groupedTasks[date]) {
            groupedTasks[date] = [];
          }
          groupedTasks[date].push(task);
        }
      });

      // Sort the date groups by date in chronological order
      const sortedGroups = Object.entries(groupedTasks).sort((a, b) => {
        return new Date(a[0]) - new Date(b[0]);
      });

      const sortedTasksByDate = {};
      sortedGroups.forEach(([date, tasks]) => {
        sortedTasksByDate[date] = tasks;
      });

      return sortedTasksByDate;
    }

    // Function to sort tasks by priority, highest to lowest
    function sortTasksByPriority(tasks) {
      return tasks.sort((a, b) => a.priority - b.priority);
    }

    // Function to format date for display as "Month Day, Year"
    function formatDateForDisplay(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    }

    $: {
      // Group tasks by date and sort them by priority
      const groupedAndSortedTasks = {};
      $tasks.forEach((task) => {
        if (!task.completed) {
          const date = task.date;
          if (!groupedAndSortedTasks[date]) {
            groupedAndSortedTasks[date] = [];
          }
          groupedAndSortedTasks[date].push(task);
        }
      });

      const sortedGroupedTasks = Object.keys(groupedAndSortedTasks)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .reduce((obj, key) => {
          obj[key] = groupedAndSortedTasks[key];
          return obj;
        }, {});

      for (const date in sortedGroupedTasks) {
        sortedGroupedTasks[date] = sortTasksByPriority(sortedGroupedTasks[date]);
      }

      // Update the tasksByDate store
      tasksByDate.set(sortedGroupedTasks);

      // Update the database in real-time when tasks change
      supabaseClient.from('user_data').update({ tasks: $tasks });
    }

    onMount(async () => {
      // Fetch the user_data from the database for the logged-in user's ID
      const { data, error } = await supabaseClient
        .from('user_data')
        .select('tasks')
        .eq('id', user.id)
        .single();

      if (!error) {
        userData = data || {};
        tasks.set(userData.tasks || []);
      } else {
        console.error('Error fetching user_data:', error);
      }
    });

    function validateAndFormatDate(date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        // If the date is not in the valid format, set it to the current date
        return new Date().toISOString().split('T')[0];
      }
      return parsedDate.toISOString().split('T')[0];
    }

    async function addTask() {
      const task: Task = {
        type: 'task',
        title: $newTask.title,
        priority: $currentPriority, // Use the writable store variable for priority
        space: 'hackerdash-123',
        project: 'svelte-app-1234',
        tags: [],
        completed: false,
        date: validateAndFormatDate($newTask.date), // Use the entered date or the current date if invalid
      };

      const newTasks = [...$tasks, task];

      try {
        const { error } = await supabaseClient
          .from('user_data')
          .update({ tasks: newTasks })
          .eq('id', user.id);

        if (!error) {
          tasks.set(newTasks); // Update the writable store with the new tasks
          newTask.set({
            type: 'task',
            title: '',
            priority: 2,
            space: 'hackerdash-123',
            project: 'svelte-app-1234',
            tags: [],
            completed: false,
            date: new Date().toISOString().split('T')[0], // Reset the date to the current date after adding the task
          });
          currentPriority.set(2);
          console.log('Task added successfully!');
        } else {
          console.error('Error updating user_data:', error);
        }
      } catch (error) {
        console.error('Error updating user_data:', error.message);
      }
      closeModal();
    }

    async function slideOutAndRemove(task) {
    task.slideOut = true;
    await new Promise((resolve) => setTimeout(resolve, 400)); // Wait for the animation duration (400ms)
    tasks.set($tasks.filter((t) => t !== task)); // Remove the task from the tasks array
  }

  function toggleTaskCompleted(task) {
    task.completed = !task.completed;

    // Show the UndoDialog when the task is completed
    if (task.completed) {
      showCompleteDialog(task);
    } else {
      // If the task is marked as not completed, slide it out and remove it
      slideOutAndRemove(task);
    }

    // Update the tasksByDate store to reflect the changes
    const updatedTasksByDate = groupTasksByDate($tasks);
    tasksByDate.set(updatedTasksByDate);

    // Update the database in real-time when tasks change
    supabaseClient.from('user_data').update({ tasks: $tasks });
  }

    // Allow users to undo completion

    let showUndoDialog = false;
    let completedTask = null;

    function showCompleteDialog(task) {
      completedTask = task;
      showUndoDialog = true;

      // Set a timer to hide the dialog after 5 seconds (5000 milliseconds)
      setTimeout(() => {
        showUndoDialog = false;
      }, 5000);
    }

    function undoComplete() {
      showUndoDialog = false;

      // Toggle the completed status of the task
      completedTask.completed = false;

      // Update the tasks store to reflect the changes
      const updatedTasks = [...$tasks];
      const taskIndex = updatedTasks.findIndex((t) => t === completedTask);
      updatedTasks[taskIndex] = completedTask;
      tasks.set(updatedTasks);

      // Update the tasksByDate store to reflect the changes
      const updatedTasksByDate = groupTasksByDate(updatedTasks);
      tasksByDate.set(updatedTasksByDate);

      // Update the database in real-time when tasks change
      supabaseClient.from('user_data').update({ tasks: updatedTasks });
    }
  </script>

  <style>
    /* Your styles here */

    #todo {
        background: white;
        padding: 0;
        border-radius: 15px;
        position: relative;
    }


  .task {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    background: white;

    margin: 10px;

    padding: 5px;
    border-radius: 10px;

    /*
    box-shadow: 0px 20px 60px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    */
  }

  .task .checkbox {
    background: rgba(0, 0, 0, 0.1);
    height: 18px;
    width: 18px;
    border-radius: 50px;
    transition: 0.2s ease;
  }

  .checkbox:hover{
    cursor: pointer;
  }

  input[type=checkbox]:focus, input[type=checkbox]:focus-visible {
    outline: none;
    border: none;
    appearance: none;
}

  .p1{
    background: #ffc7c7;
  }



  .task .checkbox.p2{
    background: #ffefd3;
  }

  .task .checkbox.p2:hover{
    background: #ffda99;
  }

  .task .title{
    font-size: 14px;
    letter-spacing: -0.3px;
    line-height: 120%;
  }

  .add{
    margin: 20px;
    width: calc(100% - 40px) !important;
  }

  /* Sticky headers */
  h1 {
    position: sticky;
    top: 5px;
    left: 0;
    font-size: 16px;
    font-weight: 600;
    background-color: white;
    padding: 5px 10px;
    background: #f0f0f0;
    border-radius: 10px;
  }

  #form {
    background: white;
    padding: 15px;
    margin: 10px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 50px;
  }

  input {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    border: none;
  }

  ::-webkit-scrollbar {
    display: none;
    width: 0;
  }

  button {
    width: 100%;
    padding: 10px;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.4s ease;
  }

  .slide-enter, .slide-leave-to /* .slide-fade-leave-active in <2.1.8 */ {
    opacity: 0;
    transform: translateX(-100%);
  }
</style>



{#if userData}
<div id="todo" class="block">

  {#if showUndoDialog}
  <UndoDialog onUndo={undoComplete} />
  {/if}

  <button class = 'add' on:click={openModal}>Add Task</button>

<Modal {showModal} title="Add Task" {closeModal} >
  <div id="form">
    <input type="text" bind:value={$newTask.title} />
    <input type="date" bind:value={$newTask.date} />
    <input type="number" bind:value={$currentPriority} />
    <button on:click|preventDefault={addTask}>Add Task</button>
  </div>
</Modal>

  <div class = 'tasks'>
    {#each Object.entries($tasksByDate) as [date, tasks]}
    {#if tasks.length > 0}
    <h1>{formatDateForDisplay(date)}</h1>
    <ul class="tasks">
      {#each tasks as task}
      {#if !task.completed}
      <li class="task" class:slide-out={task.slideOut}>
        <input class = 'checkbox p{task.priority}' type="checkbox" checked={task.completed} on:change={() => toggleTaskCompleted(task)} />
        <h2 class="title">{task.title}</h2>
      </li>
      {/if}
      {/each}
    </ul>
    {/if}
    {/each}
  </div>
</div>
{:else}
<p>Loading user_data...</p>
{/if}