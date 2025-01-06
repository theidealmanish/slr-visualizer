export default function SetsView({ sets, symbols, goto }) {
	const SetBlock = ({ title, items }) => (
		<div className='mb-6'>
			<h4 className='text-md font-medium mb-2'>{title}</h4>
			<div className='flex flex-wrap gap-2'>
				{items.map((item, index) => (
					<span
						key={index}
						className='px-2 py-1 bg-gray-100 rounded-full text-sm'
					>
						{item}
					</span>
				))}
			</div>
		</div>
	);

	return (
		<div className='space-y-6'>
			<SetBlock title='Terminals' items={sets.terminals} />
			<SetBlock title='Non-terminals' items={sets.nonterminals} />
			<SetBlock title='Action Symbols' items={symbols} />
			<SetBlock title='GOTO Symbols' items={goto} />
		</div>
	);
}
