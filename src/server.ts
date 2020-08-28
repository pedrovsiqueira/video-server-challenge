import app from './app';
import { PORT } from './configs/env';

app.listen(PORT, () => {
  console.log(`Video Server is listening on port ${PORT}`);
});
