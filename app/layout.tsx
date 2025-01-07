import './globals.css';

export const metadata = {
	title: 'SLR Visualizer',
	description: 'A tool to visualize the SLR parsing process',
};

export default function RootLayout({ children }: any) {
	return (
		<html lang='en'>
			<body className={`antialiased`}>{children}</body>
		</html>
	);
}
