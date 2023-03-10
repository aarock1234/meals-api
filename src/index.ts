require('dotenv').config();

import express from 'express';
import { Request, Response } from 'express';
import { json } from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';

import generateRecipe from './openai';

const app = express();

app.use(json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors());

interface QueueData {
	res: Response;
	focus: string;
	ingredients: string[];
}

const queue: QueueData[] = [];

setInterval(() => {
	if (queue.length > 0) {
		const queueItem: QueueData | undefined = queue.shift();
		if (!queueItem) return;

		const { res, ingredients, focus } = queueItem;

		generateRecipe(ingredients, focus).then((response) => {
			res.json({
				error: false,
				recipe: response.choices[0].text,
			});
		});
	}
}, 1000);

app.post('/api/recipe', (req: Request, res: Response) => {
	const { ingredients, focus } = req.body;

	if (!ingredients || ingredients.length === 0) {
		return res.status(400).json({ error: true, message: 'No ingredients provided' });
	}

	queue.push({ res, ingredients, focus });
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on port ${process.env.PORT || 3000}`);
});
