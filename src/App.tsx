import { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { id, token } from './env';

const AppContent = () => {
	const [ time, setTime ] = useState(moment().format('HH:mm:ss'));
	const [ date, setDate ] = useState(moment().format('DD.MM.YYYY'));
	setInterval(() => {
		setTime(moment().format('HH:mm:ss'));
		setDate(moment().format('DD.MM.YYYY'));
	}, 500);
	return (
		<div>
			<h1 className='text-5xl'>{time}</h1>
			<p className='text-2xl'>{date}</p>
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

(async () => {
	const res = await fetchTw('/users/follows?from_id=464418863');
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
	console.table(data2);
})();

async function fetchTw(endpoint: string) {
	const res = await axios.get(`https://api.twitch.tv/helix${endpoint}`, {
		headers: {
			'Client-ID': id,
			Authorization: token,
		},
	});

	return res.data;
}

export default App;
