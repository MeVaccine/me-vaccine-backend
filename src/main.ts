import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import * as helmet from 'helmet'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.use(helmet())
	app.enableCors()
	app.useGlobalPipes(new ValidationPipe())
	const config = new DocumentBuilder()
		.setTitle('MeVaccine API')
		.setDescription('The MeVaccine API description')
		.addBearerAuth({ type: 'http', description: 'JWT' }, 'Authorization')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('swagger', app, document)
	const port = process.env.PORT || 8080
	await app.listen(port)
}
bootstrap()
