require('dotenv').config();

import express from 'express';
import { Request, Response } from 'express';
import { json } from 'body-parser';
import morgan from 'morgan';

import generateRecipe from './openai';

const app = express();

app.use(json());
app.use(morgan('dev'));

interface QueueData {
	res: Response;
	ingredients: string[];
}

const queue: QueueData[] = [];

setInterval(() => {
	if (queue.length > 0) {
		const queueItem: QueueData | undefined = queue.shift();
		if (!queueItem) return;

		const { res, ingredients } = queueItem;

		generateRecipe(ingredients).then((response) => {
			res.json(response);
		});
	}
}, 1000);

app.post('/api/recipe', (req: Request, res: Response) => {
	const ingredients = req.body.ingredients;

	if (!ingredients || ingredients.length === 0) {
		return res.status(400).json({ error: true, message: 'No ingredients provided' });
	}

	queue.push({ res, ingredients });
});

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on port ${process.env.PORT || 3000}`);
});
