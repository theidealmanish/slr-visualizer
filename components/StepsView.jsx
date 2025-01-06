export default function StepsView({ headers, steps }) {
	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200'>
				<thead className='bg-gray-50'>
					<tr>
						{Object.values(headers).map((header, index) => (
							<th
								key={index}
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className='bg-white divide-y divide-gray-200'>
					{steps.map((step, index) => (
						<tr
							key={index}
							className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
						>
							<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
								{step.step_number}
							</td>
							<td className='px-6 py-4 whitespace-nowrap'>
								<ActionCell action={step.action} />
							</td>
							<td className='px-6 py-4 whitespace-nowrap font-mono text-sm'>
								{step.stack}
							</td>
							<td className='px-6 py-4 whitespace-nowrap font-mono text-sm'>
								{step.symbols}
							</td>
							<td className='px-6 py-4 whitespace-nowrap font-mono text-sm'>
								{step.input}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ActionCell({ action }) {
	let color = 'text-gray-900';
	let bg = 'bg-gray-100';

	if (action.startsWith('shift')) {
		color = 'text-blue-900';
		bg = 'bg-blue-100';
	} else if (action.startsWith('reduce')) {
		color = 'text-green-900';
		bg = 'bg-green-100';
	} else if (action === 'accept') {
		color = 'text-purple-900';
		bg = 'bg-purple-100';
	}

	return (
		<span className={`px-2 py-1 rounded-full text-sm ${color} ${bg}`}>
			{action}
		</span>
	);
}
