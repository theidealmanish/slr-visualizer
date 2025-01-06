'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import ParserOutput from '@/components/parser-output/ParserOutput';
import StepsView from '@/components/StepsView';

// Dynamic import of Graphviz component with SSR disabled
const GraphvizComponent = dynamic(
	() => import('graphviz-react').then((mod) => mod.Graphviz),
	{ ssr: false }
);

export default function Home() {
	const [grammar, setGrammar] = useState(`E -> E + T
E -> T
T -> T * F | F
F -> ( E )
F -> id
`);
	const [input, setInput] = useState('id * id + id');
	const [output, setOutput] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleParse = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch('http://localhost:5328/parse', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					grammar: grammar.trim(),
					tokens: input.trim(),
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error);
			setOutput(data);
			console.log(output);
		} catch (err) {
			// @ts-ignore
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-6 min-h-screen text-black bg-gray-100'>
			<div className='mx-auto max-w-4xl'>
				<h1 className='mb-6 text-3xl font-bold text-center'>
					SLR Parser Visualization
				</h1>

				<div className='p-6 mb-6 bg-white rounded-lg shadow'>
					<div className='mb-4'>
						<label className='block mb-2 font-bold text-gray-700'>
							Grammar Rules (one per line)
						</label>
						<textarea
							value={grammar}
							onChange={(e) => setGrammar(e.target.value)}
							className='p-2 w-full h-32 rounded border'
							placeholder='Enter grammar rules...'
						/>
					</div>

					<div className='mb-4'>
						<label className='block mb-2 font-bold text-gray-700'>
							Input String
						</label>
						<input
							type='text'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							className='p-2 w-full rounded border'
							placeholder='Enter input string...'
						/>
					</div>

					<button
						onClick={handleParse}
						disabled={loading}
						className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50'
					>
						{loading ? 'Parsing...' : 'Parse'}
					</button>
				</div>

				{error && (
					<div className='p-4 mb-6 text-red-700 bg-red-100 border-l-4 border-red-500'>
						{error}
					</div>
				)}

				{output && (
					<div className='p-6 bg-white rounded-lg shadow'>
						<div className=''>
							<h3 className='mb-4 text-lg font-bold'>General Info</h3>
							<div className='overflow-auto p-4 mb-6 bg-gray-50 rounded'>
								{/* @ts-ignore */}
								<ParserOutput data={output.info} />
							</div>
						</div>

						<div className='mt-6'>
							<h3 className='mb-4 text-lg font-bold'>Parsing Table</h3>
							<div className='overflow-auto p-4 mb-6 bg-gray-50 rounded'>
								<StepsView
									// @ts-ignore
									headers={output.parser.headers}
									// @ts-ignore
									steps={output.parser.steps}
								/>
							</div>
						</div>

						<div className='mt-6'>
							<h3 className='mb-4 text-lg font-bold'>Automaton</h3>
							<div className='overflow-auto p-4 mb-6 bg-gray-50 rounded'>
								<GraphvizComponent
									// @ts-ignore
									dot={output.automaton}
									options={{
										width: '100%',
										height: 600,
										fit: true,
										zoom: true,
									}}
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
