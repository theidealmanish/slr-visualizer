export default function GrammarView({ grammar }) {
	return (
		<div className='space-y-4'>
			<h3 className='text-lg font-semibold'>Augmented Grammar</h3>
			<div className='bg-gray-50 rounded-lg p-4'>
				{grammar.map((rule, index) => (
					<div key={index} className='font-mono mb-2'>
						<span className='text-blue-600'>{rule.head}</span>
						<span className='mx-2'>→</span>
						<span>{rule.body}</span>
					</div>
				))}
			</div>
		</div>
	);
}
