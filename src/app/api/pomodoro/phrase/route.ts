import { withAuth } from '@/lib/auth/middleware';
import { getRandomPhrase } from '@/lib/scrapers/phrases';

export const GET = withAuth(async () => {
  try {
    const phrase = await getRandomPhrase();
    return Response.json({ phrase });
  } catch (error) {
    console.error('Error getting phrase:', error);
    return Response.json({ phrase: '¡Cada minuto cuenta en tu camino hacia el éxito!' });
  }
});
