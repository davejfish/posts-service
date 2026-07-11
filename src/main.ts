import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  const url = `http://localhost:${port}`;
  console.log(`🚀 posts-service running at ${url}`);
  console.log(`🔎 GraphQL endpoint:      ${url}/graphql`);
}
bootstrap();
