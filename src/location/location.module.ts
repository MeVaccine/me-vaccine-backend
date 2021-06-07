import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Location, LocationSchema } from 'src/schema/Location.schema'
import { LocationService } from './location.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }])],
	providers: [LocationService],
	exports: [LocationService],
})
export class LocationModule {}
