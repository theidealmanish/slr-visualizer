'use client';

import { useState } from 'react';
import GrammarView from '@/components/parser-output/GrammarView';
import SetsView from '@/components/parser-output/SetsView';
import FirstFollowView from '@/components/parser-output/FirstFollowView';
import ParsingTableView from '@/components/parser-output/ParsingTableView';

export default function ParserOutput({
	data = {
		action_symbols: ['(', '+', '*', 'id', ')', '$'],
		augmented_grammar: [
			{
				body: 'E',
				head: "E'",
				index: 0,
			},
			{
				body: 'E + T',
				head: 'E',
				index: 1,
			},
			{
				body: 'T',
				head: 'E',
				index: 2,
			},
			{
				body: 'T * F',
				head: 'T',
				index: 3,
			},
			{
				body: 'F',
				head: 'T',
				index: 4,
			},
			{
				body: '( E )',
				head: 'F',
				index: 5,
			},
			{
				body: 'id',
				head: 'F',
				index: 6,
			},
		],
		first: {
			E: ['(', 'id'],
			"E'": ['(', 'id'],
			F: ['(', 'id'],
			T: ['(', 'id'],
		},
		follow: {
			E: ['+', '$', ')'],
			"E'": ['$'],
			F: ['+', '*', '$', ')'],
			T: ['+', '*', '$', ')'],
		},
		goto_symbols: ['E', 'T', 'F'],
		parsing_table: {
			0: {
				'(': 's1',
				E: '4',
				F: '5',
				T: '3',
				id: 's2',
			},
			1: {
				'(': 's1',
				E: '6',
				F: '5',
				T: '3',
				id: 's2',
			},
			2: {
				$: 'r6',
				')': 'r6',
				'*': 'r6',
				'+': 'r6',
			},
			3: {
				$: 'r2',
				')': 'r2',
				'*': 's7',
				'+': 'r2',
			},
			4: {
				$: 'acc',
				'+': 's8',
			},
			5: {
				$: 'r4',
				')': 'r4',
				'*': 'r4',
				'+': 'r4',
			},
			6: {
				')': 's9',
				'+': 's8',
			},
			7: {
				'(': 's1',
				F: '10',
				id: 's2',
			},
			8: {
				'(': 's1',
				F: '5',
				T: '11',
				id: 's2',
			},
			9: {
				$: 'r5',
				')': 'r5',
				'*': 'r5',
				'+': 'r5',
			},
			10: {
				$: 'r3',
				')': 'r3',
				'*': 'r3',
				'+': 'r3',
			},
			11: {
				$: 'r1',
				')': 'r1',
				'*': 's7',
				'+': 'r1',
			},
		},
		sets: {
			nonterminals: ['E', 'T', "E'", 'F'],
			symbols: ['(', '+', '*', 'id', 'T', "E'", 'E', 'F', ')'],
			terminals: ['(', '+', '*', 'id', ')'],
		},
	},
}) {
	const [activeTab, setActiveTab] = useState('grammar');

	return (
		<div className='bg-white rounded-lg shadow-lg p-6'>
			<div className='border-b border-gray-200'>
				<nav className='-mb-px flex space-x-8'>
					{['Grammar', 'Sets', 'FIRST/FOLLOW', 'Parsing Table'].map((tab) => (
						<button
							key={tab.toLowerCase()}
							onClick={() => setActiveTab(tab.toLowerCase())}
							className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${
									activeTab === tab.toLowerCase()
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:border-gray-300'
								}
              `}
						>
							{tab}
						</button>
					))}
				</nav>
			</div>

			<div className='mt-6'>
				{activeTab === 'grammar' && (
					<GrammarView grammar={data.augmented_grammar} />
				)}
				{activeTab === 'sets' && (
					<SetsView
						sets={data.sets}
						symbols={data.action_symbols}
						goto={data.goto_symbols}
					/>
				)}
				{activeTab === 'first/follow' && (
					<FirstFollowView first={data.first} follow={data.follow} />
				)}
				{activeTab === 'parsing table' && (
					<ParsingTableView table={data.parsing_table} />
				)}
			</div>
		</div>
	);
}
