import express, {Request, Response} from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { AIRPORTS, getAirportByIataCode } from './airports';
const app = express();

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

app.use(compression());
app.use(morgan('tiny'));

app.get('/airports', async (req : Request, res : Response): Promise<void> => {
  res.header('Content-Type', 'application/json')
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  res.json({ data: AIRPORTS });
})

app.get('/airports/:iataCode', async (req : Request, res : Response): Promise<void> => {
  const { iataCode } = req.params;

  const airport = getAirportByIataCode(iataCode);

  res.header('Content-Type', 'application/json')
  res.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

  if (airport) {
    res.json({ data: airport });
  } else {
    res.status(404).json({ data: { error: "Not found" }});
  }
})

export default app;