import { Configuration, OpenAIApi } from 'openai';

const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

async function generateRecipe(ingredients: string[]) {
	const prompt = `Write a recipe based on some or all of these ingredients:\n\nIngredients:\n${ingredients.join(
		'\n'
	)}\n\nRecipe name, instructions & measurements:\n\n`;

	const response = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt,
		max_tokens: Number(process.env.MAX_TOKENS) || 360,
		temperature: 0.3,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});

	return response.data;
}

export default generateRecipe;