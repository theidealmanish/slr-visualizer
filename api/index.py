from graphviz import Digraph
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Grammar class


class Grammar:
    def __init__(self, grammar_str):
        self.grammar_str = self._clean_grammar_string(grammar_str)
        self.grammar = {}
        self.start = None
        self.terminals = set()
        self.nonterminals = set()

        self._parse_grammar()
        self.symbols = self.terminals | self.nonterminals

    def _clean_grammar_string(self, grammar_str):
        return '\n'.join(' '.join(line.split()) for line in grammar_str.strip().splitlines() if line.strip())

    def _validate_head(self, head):
        if not head.isupper():
            raise ValueError(f'Nonterminal head \'{head}\' must be uppercase.')

    def _validate_body(self, head, body):
        if not body:
            raise ValueError(f'\'{head} -> \': Cannot have an empty body.')
        if '^' in body and body != ['^']:
            raise ValueError(
                f'\'{head} -> {" ".join(body)}\': Null symbol \'^\' is not allowed here.')

    def _update_symbols(self, body):
        for symbol in body:
            if symbol.isupper():
                self.nonterminals.add(symbol)
            elif symbol != '^':
                self.terminals.add(symbol)

    def _process_bodies(self, head, bodies):
        for body in bodies:
            self._validate_body(head, body)
            if body not in self.grammar[head]:
                self.grammar[head].append(body)
            self._update_symbols(body)

    def _parse_grammar(self):
        if not self.grammar_str:
            raise ValueError('Grammar definition cannot be empty.')

        for production in self.grammar_str.splitlines():
            head, _, bodies = production.partition(' -> ')
            self._validate_head(head)

            if self.start is None:
                self.start = head

            self.grammar.setdefault(head, [])
            self.nonterminals.add(head)

            bodies = [(body.split()) for body in bodies.split('|')]
            self._process_bodies(head, bodies)


def first_follow(G):
    def union(set_1, set_2):
        original_size = len(set_1)
        set_1.update(set_2)
        return original_size != len(set_1)

    first = {symbol: set() for symbol in G.symbols}
    first.update((terminal, {terminal}) for terminal in G.terminals)
    follow = {symbol: set() for symbol in G.nonterminals}
    follow[G.start].add('$')

    while True:
        updated = False

        for head, bodies in G.grammar.items():
            for body in bodies:
                for symbol in body:
                    if symbol != '^':
                        updated |= union(first[head], first[symbol] - {'^'})
                        if '^' not in first[symbol]:
                            break
                    else:
                        updated |= union(first[head], {'^'})
                else:
                    updated |= union(first[head], {'^'})

                aux = follow[head]
                for symbol in reversed(body):
                    if symbol == '^':
                        continue
                    if symbol in follow:
                        updated |= union(follow[symbol], aux - {'^'})
                    if '^' in first[symbol]:
                        aux = aux | first[symbol]
                    else:
                        aux = first[symbol]

        if not updated:
            return first, follow

# SLR Parser class


class SLRParser:
    def __init__(self, G):
        self.G_prime = Grammar(f"{G.start}' -> {G.start}\n{G.grammar_str}")
        self.G_indexed = [
            {'head': head, 'body': body}
            for head, bodies in self.G_prime.grammar.items()
            for body in bodies
        ]
        self.first, self.follow = first_follow(self.G_prime)
        self.C = self.items(self.G_prime)
        self.parsing_table = self.construct_parsing_table()
        self.action_symbols = list(self.G_prime.terminals) + ['$']
        self.max_nonterminal_len = max(len(nonterminal)
                                       for nonterminal in self.G_prime.nonterminals)

    def CLOSURE(self, I):
        J = I.copy()

        while True:
            original_size = len(J)

            for i, dot_pos in J:
                body = self.G_indexed[i]['body']
                if dot_pos < len(body):
                    symbol_after_dot = body[dot_pos]
                    if symbol_after_dot in self.G_prime.nonterminals:
                        for body in self.G_prime.grammar[symbol_after_dot]:
                            new_item = (self.G_indexed.index(
                                {'head': symbol_after_dot, 'body': body}), 0)
                            if new_item not in J:
                                J.append(new_item)

            if len(J) == original_size:
                return J

    def GOTO(self, I, X):
        goto = []

        for i, dot_pos in I:
            body = self.G_indexed[i]['body']
            if dot_pos < len(body) and body[dot_pos] == X:
                for new_item in self.CLOSURE([(i, dot_pos + 1)]):
                    if new_item not in goto:
                        goto.append(new_item)

        return goto

    def items(self, G_prime):
        C = [self.CLOSURE([(0, 0)])]

        while True:
            original_size = len(C)

            for I in C:
                for X in G_prime.symbols:
                    goto = self.GOTO(I, X)
                    if goto and goto not in C:
                        C.append(goto)

            if len(C) == original_size:
                return C

    def construct_parsing_table(self):
        parsing_table = {}

        for s, I in enumerate(self.C):
            parsing_table[s] = {}

            for i, dot_pos in I:
                head = self.G_indexed[i]['head']
                body = self.G_indexed[i]['body']
                body = [] if body == ['^'] else body

                if dot_pos < len(body):  # CASE 2a: Symbol after dot
                    symbol_after_dot = body[dot_pos]
                    if symbol_after_dot in self.G_prime.terminals:
                        j = self.GOTO(I, symbol_after_dot)
                        action = f's{self.C.index(j)}'

                        if symbol_after_dot in parsing_table[s]:
                            if action not in parsing_table[s][symbol_after_dot]:
                                parsing_table[s][symbol_after_dot] += f'/{action}'
                        else:
                            parsing_table[s][symbol_after_dot] = action

                elif dot_pos == len(body):  # CASE 2b: Dot is at the end
                    if head != self.G_prime.start:
                        for a in self.follow[head]:
                            if a in parsing_table[s]:
                                if f'r{i}' not in parsing_table[s][a]:
                                    parsing_table[s][a] += f'/r{i}'
                            else:
                                parsing_table[s][a] = f'r{i}'
                    else:  # CASE 2c: If it's the start production
                        parsing_table[s]['$'] = 'acc'

            # CASE 3: Handle the transitions for non-terminals
            for A in self.G_prime.nonterminals:
                j = self.GOTO(I, A)
                if j in self.C:
                    parsing_table[s][A] = self.C.index(j)

        return parsing_table

    def print_info(self):
        info = {
            "augmented_grammar": [
                {
                    "index": i,
                    "head": production["head"],
                    "body": " ".join(production["body"])
                }
                for i, production in enumerate(self.G_indexed)
            ],
            "sets": {
                "terminals": list(self.G_prime.terminals),
                "nonterminals": list(self.G_prime.nonterminals),
                "symbols": list(self.G_prime.symbols)
            },
            "first": {
                head: list(self.first[head])
                for head in self.G_prime.grammar
            },
            "follow": {
                head: list(self.follow[head])
                for head in self.G_prime.grammar
            },
            "parsing_table": {
                str(state): {
                    str(symbol): str(action)
                    for symbol, action in actions.items()
                }
                for state, actions in self.parsing_table.items()
            },
            "action_symbols": self.action_symbols,
            "goto_symbols": list(self.G_prime.nonterminals - {self.G_prime.start})
        }
        return info

    def generate_automaton(self):
        automaton = Digraph('automaton', node_attr={'shape': 'record'})

        def format_symbol(symbol):
            if symbol in self.G_prime.nonterminals:
                return f'<I>{symbol}</I>'
            elif symbol in self.G_prime.terminals:
                return f'<B>{symbol}</B>'
            return symbol

        for s in self.parsing_table:
            I_html_parts = [f'<<I>I</I><SUB>{s}</SUB><BR/>']

            for i, dot_pos in self.C[s]:
                head = self.G_indexed[i]['head']
                body = self.G_indexed[i]['body'].copy()
                body = [] if body == ['^'] else body
                body.insert(dot_pos, '.')
                I_html_parts.append(
                    f'<I>{head:>{self.max_nonterminal_len}}</I> &#8594; ')
                I_html_parts.append(' '.join(format_symbol(symbol)
                                    for symbol in body))
                I_html_parts.append('<BR ALIGN="LEFT"/>')

            I_html = ''.join(I_html_parts)
            automaton.node(f'I{s}', f'{I_html}>')

            for symbol, entry in self.parsing_table[s].items():
                if isinstance(entry, int):
                    automaton.edge(f'I{s}', f'I{entry}',
                                   label=f'<<I>{symbol}</I>>')
                elif 's' in entry:
                    j = entry.split('s')[1].split('/')[0]
                    automaton.edge(f'I{s}', f'I{j}',
                                   label=f'<<B>{symbol}</B>>')
                elif entry == 'acc':
                    automaton.node('acc', '<<B>accept</B>>', shape='none')
                    automaton.edge(f'I{s}', 'acc', label='$')
        return automaton

    def LR_parser(self, w):
        buffer = f'{w} $'.split()
        pointer = 0
        a = buffer[pointer]
        stack = ['0']
        symbols = ['']
        results = {
            'step': [''],
            'stack': ['STACK'] + stack,
            'symbols': ['SYMBOLS'] + symbols,
            'input': ['INPUT'],
            'action': ['ACTION']
        }

        step = 0
        while True:
            s = int(stack[-1])
            step += 1
            results['step'].append(f'({step})')
            results['input'].append(' '.join(buffer[pointer:]))

            if a not in self.action_symbols:
                results['action'].append(f'ERROR: unrecognized symbol {a}')
                break

            action = self.parsing_table[s].get(a, '')

            if not action:
                results['action'].append(
                    'ERROR: input cannot be parsed by given grammar')
                break

            elif '/' in action:
                conflict_type = 'reduce' if action.count('r') > 1 else 'shift'
                results['action'].append(
                    f'ERROR: {conflict_type}-reduce conflict at state {s}, symbol {a}')
                break

            elif action.startswith('s'):
                stack.append(action[1:])
                symbols.append(a)
                results['stack'].append(' '.join(stack))
                results['symbols'].append(' '.join(symbols[1:]))
                results['action'].append('shift')
                pointer += 1
                a = buffer[pointer]

            elif action.startswith('r'):
                production = self.G_indexed[int(action[1:])]
                head = production['head']
                body = production['body']

                if body != ['^']:
                    stack = stack[:-len(body)]
                    symbols = symbols[:-len(body)]

                stack.append(str(self.parsing_table[int(stack[-1])][head]))
                symbols.append(head)
                results['stack'].append(' '.join(stack))
                results['symbols'].append(' '.join(symbols[1:]))
                results['action'].append(
                    f'reduce by {head} -> {" ".join(body)}')

            elif action == 'acc':
                results['action'].append('accept')
                break
        return results

    def print_LR_parser(self, results):
        steps = []

        for i in range(1, len(results['step'])):
            step = {
                'step_number': results['step'][i],
                'stack': results['stack'][i],
                'symbols': results['symbols'][i],
                'input': results['input'][i],
                'action': results['action'][i]
            }
            steps.append(step)

        parsing_data = {
            'headers': {
                'step': results['step'][0],
                'stack': results['stack'][0],
                'symbols': results['symbols'][0],
                'input': results['input'][0],
                'action': results['action'][0]
            },
            'steps': steps
        }

        return parsing_data


@app.route('/parse', methods=['POST', 'OPTIONS'])
def parse():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json()

        if not data or 'grammar' not in data or 'tokens' not in data:
            return jsonify({
                'error': 'Missing required fields: grammar and tokens'
            }), 400

        grammar = data['grammar']
        tokens = data['tokens']

        # Create Grammar and Parser
        G = Grammar(grammar)
        slr_parser = SLRParser(G)

        info = slr_parser.print_info()
        results = slr_parser.LR_parser(tokens)
        parser = slr_parser.print_LR_parser(results)
        automaton = str(slr_parser.generate_automaton())

        return jsonify({
            'success': True,
            'results': results,
            'info': info,
            'parser': parser,
            'automaton': automaton
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True)
