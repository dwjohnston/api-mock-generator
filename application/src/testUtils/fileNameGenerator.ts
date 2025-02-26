export function generateFileName(inputData: {
	functionName: string;
	iteration: number;
	priority: number;
	description: string;
}): string {
	const { functionName, iteration, priority, description } = inputData;
	return `${functionName}_${iteration}.${priority}${description}`;
}
