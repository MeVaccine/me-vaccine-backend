import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = new DocumentBuilder()
		.setTitle('MeVaccine API')
		.setDescription('The MeVaccine API description')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('swagger', app, document)
	const port = process.env.PORT || 8080
	await app.listen(port)
}
bootstrap()
