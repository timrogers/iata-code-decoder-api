import express, { Request, Response } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { AIRPORTS } from './airports';
import { AIRLINES } from './airlines';
import { AIRCRAFT } from './aircraft';
import { Keyable } from './types';
const app = express();

const QUERY_MUST_BE_PROVIDED_ERROR = {
  data: {
    error: 'A search query must be provided via the `query` querystring parameter',
  },
};
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

app.use(compression());
app.use(morgan('tiny'));

const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable | undefined => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.status(200).json({ success: true });
});

app.get('/airports', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
    res.json({ data: airports });
  }
});

app.get('/airlines', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const airlines = filterObjectsByPartialIataCode(AIRLINES, query, 2);

    res.json({
      data: airlines,
    });
  }
});

app.get('/aircraft', async (req: Request, res: Response): Promise<void> => {
  res.header('Content-Type', 'application/json');
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (req.query.query === undefined || req.query.query === '') {
    res.status(400).json(QUERY_MUST_BE_PROVIDED_ERROR);
  } else {
    const query = req.query.query as string;
    const aircraft = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
    res.json({ data: aircraft });
  }
});

export default app;
