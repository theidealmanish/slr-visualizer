export default function FirstFollowView({ first, follow }) {
	const SetDisplay = ({ title, data }) => (
		<div className='mb-6'>
			<h4 className='text-md font-medium mb-4'>{title} Sets</h4>
			<div className='grid grid-cols-1 gap-2'>
				{Object.entries(data).map(([symbol, set]) => (
					<div key={symbol} className='flex items-center space-x-2'>
						<span className='font-mono w-16'>{symbol}:</span>
						<div className='flex flex-wrap gap-1'>
							{set.map((item, index) => (
								<span
									key={index}
									className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
								>
									{item}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className='space-y-8'>
			<SetDisplay title='FIRST' data={first} />
			<SetDisplay title='FOLLOW' data={follow} />
		</div>
	);
}
