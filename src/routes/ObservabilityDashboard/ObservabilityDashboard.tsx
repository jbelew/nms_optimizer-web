import { useEffect, useState } from "react";
import { Box, Button, Card, Flex, Heading, Text } from "@radix-ui/themes";

import { Logger } from "../../utils/logger";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";

export default function ObservabilityDashboard() {
	const [logs, setLogs] = useState(Logger.getLogs());

	useEffect(() => {
		// Clear splash screen
		void hideSplashScreenAndShowBackground();

		// Basic polling or just initial load for now
		const interval = setInterval(() => {
			setLogs(Logger.getLogs());
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<Box p="4">
			<Flex justify="between" align="center" mb="4">
				<Heading>Observability Dashboard</Heading>
				<Button
					color="red"
					variant="soft"
					onClick={() => {
						Logger.clearLogs();
						setLogs([]);
					}}
				>
					Clear Logs
				</Button>
			</Flex>

			<Flex direction="column" gap="2">
				{logs.length === 0 ? (
					<Text color="gray">No logs captured yet.</Text>
				) : (
					logs.map((log, i) => (
						<Card key={i}>
							<Flex direction="column">
								<Flex justify="between">
									<Text
										weight="bold"
										color={
											log.level === "ERROR"
												? "red"
												: log.level === "WARN"
													? "amber"
													: "blue"
										}
									>
										[{log.level}] {new Date(log.timestamp).toLocaleTimeString()}
									</Text>
								</Flex>
								<Text size="2">{log.message}</Text>
								{log.data && (
									<Box
										mt="2"
										p="2"
										style={{
											backgroundColor: "var(--gray-2)",
											borderRadius: "4px",
										}}
									>
										<pre
											style={{
												margin: 0,
												fontSize: "10px",
												overflow: "auto",
											}}
										>
											{JSON.stringify(log.data, null, 2)}
										</pre>
									</Box>
								)}
							</Flex>
						</Card>
					))
				)}
			</Flex>
		</Box>
	);
}
