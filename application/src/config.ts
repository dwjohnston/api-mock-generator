type Config = {
	//relevantHeaders: Array<string>;

	defaultValidationPort: number;
};

export const config: Config = {
	defaultValidationPort: process.env.DEFAULT_VALIDATION_PORT
		? Number.parseInt(process.env.DEFAULT_VALIDATION_PORT)
		: 3001,
};
