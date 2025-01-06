export default function ParsingTableView({ table }) {
	const headers = [
		...new Set(Object.values(table).flatMap((row) => Object.keys(row))),
	];

	return (
		<div className='overflow-x-auto'>
			<table className='min-w-full divide-y divide-gray-200'>
				<thead className='bg-gray-50'>
					<tr>
						<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
							State
						</th>
						{headers.map((header) => (
							<th
								key={header}
								className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className='bg-white divide-y divide-gray-200'>
					{Object.entries(table).map(([state, actions]) => (
						<tr key={state}>
							<td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
								{state}
							</td>
							{headers.map((header) => (
								<td
									key={header}
									className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
								>
									{actions[header] || ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
