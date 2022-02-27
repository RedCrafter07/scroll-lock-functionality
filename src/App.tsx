import { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { id, token } from './env';

let render = 0;

const AppContent = () => {
	const [ time, setTime ] = useState(moment().format('HH:mm:ss'));
	const [ date, setDate ] = useState(moment().format('DD.MM.YYYY'));
	const [ live, setLive ] = useState([
		{
			login: 'N/A',
			name: 'Loading...',
			id: 'N/A',
			profilePicture: '',
		},
	]);
	setInterval(() => {
		setTime(moment().format('HH:mm:ss'));
		setDate(moment().format('DD.MM.YYYY'));
	}, 500);

	if (render == 0) {
		render++;
		(async () => {
			const response = await getData();
			setLive(response);
		})();
		setInterval(async () => {
			const response = await getData();
			setLive(response);
		}, 10 * 1000);
	}

	return (
		<div>
			<h1 className='text-5xl'>{time}</h1>
			<p className='text-2xl'>{date}</p>
			<hr className='my-12 opacity-50' />
			<p className='text-2xl'>Live Streams</p>
			<p className='text-xl'>
				Below you can see the live status from the people you follow.
			</p>

			<div className='my-6' />

			<div className='grid gap-4 grid-cols-8'>
				{live.length > 0 ? (
					live.map((v, i) => {
						return (
							<div key={i}>
								<a
									href={`https://twitch.tv/${v.login}`}
									target={'_blank'}
									title={v.name}
								>
									<img
										src={v.profilePicture}
										className='rounded-full w-full h-full border-4 border-red-600'
										alt={`${v.name}'s Profile Picture`}
									/>
								</a>
							</div>
						);
					})
				) : (
					'No streamers live :/'
				)}
			</div>
		</div>
	);
};

const App = () => {
	return (
		<div className='text-white w-screen h-screen'>
			<div className='title-bar-bg'>
				<div className='w-1/4 h-1 bg-white rounded-full' />
			</div>
			<div className='h-full rounded-lg drop-shadow-2xl px-4 py-4 overflow-hidden'>
				<AppContent />
			</div>
		</div>
	);
};

async function fetchTw(endpoint: string) {
	const res = await axios.get(`https://api.twitch.tv/helix${endpoint}`, {
		headers: {
			'Client-ID': id,
			Authorization: token,
		},
	});

	return res.data;
}

/* function objectize(input: Array<any>, key: string) {
	const obj: any = {};
	input.forEach(v => {
		if (!obj[v[key]]) obj[v[key]] = {};
		obj[v[key]] = v;
	});

	return obj;
} */

async function getData() {
	const res1: any = await fetchLivestreams();
	const profilePictures: any = await getProfilePictures(
		res1.map((v: any) => {
			return v.user_login;
		})
	);

	const data = res1.map((v: any, i: number) => {
		return {
			login: v.user_login,
			name: v.user_name,
			id: v.user_id,
			profilePicture: profilePictures[i],
		};
	});

	return data;
}

async function getProfilePictures(logins: Array<string>) {
	const res = await fetchTw(`/users?login=${logins.join('&login=')}`);
	let data = res.data;
	data = data.map((v: any) => {
		return v.profile_image_url;
	});

	return data;
}

async function fetchLivestreams() {
	const res = await fetchTw('/users/follows?from_id=464418863&first=100');
	const data: Array<{ to_id: string; to_login: string; to_name: string }> =
		res.data;
	const data2 = data.map(
		(s: { to_id: string; to_login: string; to_name: string }) => {
			return {
				id: s.to_id,
				login: s.to_login,
				name: s.to_name,
			};
		}
	);

	const res2 = await fetchTw(
		`/streams?user_id=${data2.map(v => v.id).join('&user_id=')}&first=100`
	);

	const dataStuff: Array<{
		game_id: string;
		game_name: string;
		id: string;
		is_mature: boolean;
		language: string;
		started_at: string;
		tag_ids: Array<string>;
		thumbnail_url: string;
		title: string;
		type: string;
		user_id: string;
		user_login: string;
		user_name: string;
		viewer_count: number;
	}> =
		res2.data;

	return dataStuff;
}

export default App;
