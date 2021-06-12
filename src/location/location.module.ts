import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Location, LocationSchema } from 'src/schema/Location.schema'
import { LocationService } from './location.service'
import { LocationController } from './location.controller'
import { UserModule } from 'src/user/user.module'
import { Vaccine, VaccineSchema } from 'src/schema/Vaccine.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Location.name, schema: LocationSchema },
			{ name: Vaccine.name, schema: VaccineSchema },
		]),
		UserModule,
	],
	providers: [LocationService],
	exports: [LocationService],
	controllers: [LocationController],
})
export class LocationModule {}
