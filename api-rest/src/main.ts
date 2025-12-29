import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const chalk = (await import('chalk')).default;
  
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Planner Financeiro API')
    .setDescription('API para gerenciamento financeiro')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  
  await app.listen(port);

  console.log('\n');
  console.log(chalk.green.bold('✓ Aplicação iniciada com sucesso!\n'));
  console.log(chalk.cyan('📍 Servidor:    '), chalk.white(`http://localhost:${port}`));
  console.log(chalk.cyan('📚 Documentação:'), chalk.white(`http://localhost:${port}/api/docs`));
  console.log(chalk.cyan('🏥 Health Check:'), chalk.white(`http://localhost:${port}/health`));
  console.log(chalk.cyan('📊 Ambiente:    '), chalk.white(process.env.NODE_ENV || 'development'));
  console.log('\n');
  console.log(chalk.yellow.bold('🔗 Rotas disponíveis:\n'));
  
  // Lista os endpoints do Swagger
  Object.entries(document.paths).forEach(([path, methods]: [string, any]) => {
    Object.keys(methods).forEach(method => {
      const methodUpper = method.toUpperCase();
      const methodColor = method === 'get' ? chalk.green : 
                         method === 'post' ? chalk.blue :
                         method === 'put' ? chalk.yellow :
                         method === 'patch' ? chalk.magenta :
                         method === 'delete' ? chalk.red : chalk.white;
      
      console.log(`  ${methodColor(methodUpper.padEnd(7))} ${chalk.white(path)}`);
    });
  });
  
  console.log('\n');
}
bootstrap();
