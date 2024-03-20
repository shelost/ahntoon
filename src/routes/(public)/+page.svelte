<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { supabaseClient } from '$lib/db';
	import { fly } from 'svelte/transition'
	import Space from '$lib/components/Space.svelte'
	import bg from '$lib/img/background.svg'
	import icon from '$lib/img/favicon.png'


	import Navbar from '$lib/components/common/NavBar.svelte'
	import Gradient from '$lib/img/gradient.png'
	import Hero from '$lib/img/Hero.png'
	import Feature from '$lib/img/feature.png'
	import Collection from '$lib/img/collection.png'

	import Logo from '$lib/img/ahntoon.png'

	// Create a Svelte store to hold the spaces data
	let series = writable([]);


    // Fetch
	async function fetchSeries(){

		// Get notes
		const { data: n, error } = await supabaseClient
			.from('series')
			.select('*')

		if (!error) {

			series.set(n)



			/*

			// Get author
			for (let i=0; i<$series.length; i++){
				let serie = $series[i]

				const {data : d, error: e} = await supabaseClient
						.from('profiles')
						.select('*')
						.eq('id', serie.user_id)

				if (!error) {

				} else {
					console.error('Error fetching user_data:', error);
				}
			}

			// Get space
			for (let i=0; i<$series.length; i++){
				let note = $series[i]
				const {data : d, error: e} = await supabaseClient
						.from('spaces')
						.select('*')
						.eq('id', note.space_id)


				if (!e) {

					$series[i].title = d[0].title;
					$series[i].icon = d[0].icon;
				} else {
					console.error('Error fetching user_data:', e);
				}
			}

			*/
		} else {
			console.error('Error fetching user_data:', error);
		}
    }



	onMount(()=>{

		fetchSeries()
	})



</script>

<svelte:head>
	<title> Scrollable: Your Ultimate Reading App </title>
	<meta name="description" content="Explore Scrollable - your final reading app. Find all the classics in a scrollable form, get the recent releases, and subscribe to our updates!" />
	<link rel="icon" href={icon} />
</svelte:head>


<div id = 'app'>


	<div id = 'splash'>

		<div id = 'mast'>

			<img id = 'logo' src = '{Logo}' />

			<h1>
				Ahntoon
			</h1>

			<h2>
				Hi! This is where I upload my comics & short stories.
			</h2>

			<form id ='form' method='POST' action='https://script.google.com/macros/s/AKfycbwjjIXz1y8mAeGv0CTSawvyctFqITZ1nXTQjo318v8_Tp1Hjf4lq3RmqbOQmUAhKi7Q/exec'>
				<input id = 'email' name = 'Email' type = 'email' placeholder = 'your@email.com' required>
				<button id = 'submit' type = 'submit'> Join </button>
			</form>

		</div>



		<div id = 'section'  in:fly="{{ y: 200, duration: 500, delay: 200 }}">



			<div id = 'top'>

				<h2 id = 'title'> Recent Releases </h2>

			</div>

			<div id = 'spaces'>
				{#each $series as space}
					<Space {space} page={true} />
				{/each}
			</div>
		</div>


	</div>




	<div id = 'footer'>

		<div id = 'socials'>

			<a href = ''>
				<img src = ''>
			</a>

			<a href = ''>
				<img src = ''>
			</a>

			<a href = ''>
				<img src = ''>
			</a>

			<a href = ''>
				<img src = ''>
			</a>

		</div>


	</div>

</div>

<style lang="scss">

	@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,200;1,6..72,300;1,6..72,400;1,6..72,500;1,6..72,600;1,6..72,700;1,6..72,800&display=swap');





	#section{
		height: 100vh;
		overflow: scroll;
		background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;
		background: rgba(white, 0.3);

		width: fill;


		#title{
			font-family: 'Newsreader', sans-serif;
			font-weight: 700;
			letter-spacing: -0.5px;
			font-size: 28px;
			padding: 30px 45px;
		}

		#spaces{
			display: flex;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
			gap: 30px 30px;
			padding: 10px;
		}

	}


	@keyframes pill{
		from{
			bottom: 30px;
		}
		to{
			bottom: 20px;
		}
	}

	#form{
		display: flex;
		align-items: center;
		background: white;
		transition: 0.2s ease;
		padding: 10px;
		border-radius: 50px;
		max-width: 320px;

		input{
			outline: none !important;
			border-radius: 50px;
			&:focus{
				outline: none !important;
				border: none !important;
			}
		}

		button{
			background: black;
			padding: 10px 20px;
			font-family: 'Inter', sans-serif;
			font-size: 14px;
			border-radius: 50px;

			&:hover{
				background: #202020;
			}
		}
	}



	#submit{
		font-family: 'Newsreader', 'Libre Baskerville', sans-serif;
		font-size: 18px;
		font-weight: 600;
		padding: 12px 0;
	}



	.form_title{
		font-weight: 700;
		margin-bottom: 30px;
	}

	label{
		font-size: 14px;
		opacity: 0.4;
		margin-bottom: 5px;
	}

	input{
		width: 300px;
		font-size: 14px;
		border-radius: 5px;
	}



	#app{
		position: fixed;
		top: 0px;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: #e0e0e0;
		overflow-y: hidden;
		overflow-x: hidden;
	}



	/* Spaces */



	/* Splash */
	#splash {
		margin: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		background-size: cover;
		background-position: center center;

		display: flex;
		justify-content: space-between;
		align-items: flex-start;


		#logo{
			height: 170px;
			border-radius: 15px;
			margin-bottom: 30px;
		}

	}

	@keyframes slide{
		from{
			opacity: 0;
			transform: translate(100px, 120px);
		}
		to{
			opacity: 1;
			transform: rotate(-10deg) translate(30px, 150px);
		}
	}



	#mast{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-bottom: 50px;
		padding: 0px 60px;
		height: 100vh;


		h1{
			font-size: 44px;
			line-height: 100%;
			font-weight: 900;
			letter-spacing: -1px;
			margin-bottom: 25px;
			text-align: flex-start;
		}

		h2{
			font-size: 15px;
			letter-spacing: -0.2px;
			margin-bottom: 30px;
			text-align: center;
			color: rgba(black, 0.5);
		}
	}


	#socials {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: 30px;

		opacity: 0;
		animation: float 0.6s ease 0.25s forwards;
	}

	.icon {
		height: 32px;
	}



	@media screen and (max-width: 800px){

		#banner{
			height: 80vh !important;
			background-image: linear-gradient(to bottom left, #A1EEFF, #A1FFE9) !important;
		}

		#banner h1{
			width: 100vw;
			font-size: 50px;
			line-height: 100%;
		}

		.center{
			align-items: center;
			margin: 0;
		}

		#splash{
			margin: 0;
			padding: 0 !important;
			display: flex;
			flex-direction: column-reverse !important;
			align-items: center !important;
			justify-content: center !important;
		}


		#form{
			width: 88vw;
			margin: auto;
		}

		#mast h1{
			font-size: 38px !important;
			font-weight: 500;
			text-align: center;
		}

		#form{
			padding: 10px;
			display: flex;
			flex-direction: column;
		}

		#form button{
			margin-top: 10px;
			width: 100%;
		}

		#splash{
			gap: -50px !important;
		}

		.split{
			margin: 0 -10px;
		}

		.split img{
			width: 40vw !important;
			height: 70vw !important;
			margin: 0;
		}

		.split{
			transform: translateY(40px);
		}

		.split.white{
			transform: translateY(-60px);
		}

		.split h1{
			line-height: 110%;
			font-size: 24px !important;
		}

		.expo h1{
			margin-bottom: 0px !important;
			padding-bottom: 0px !important;
		}

		.expo h2{
			margin-top: 0px !important;
		}



	}


</style>
