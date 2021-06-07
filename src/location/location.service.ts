import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Location } from 'src/schema/Location.schema'
import { MongoRepository } from 'typeorm'

@Injectable()
export class LocationService {
	constructor(@InjectRepository(Location) private locationRepository: MongoRepository<Location>) {}

	async findById(locationId: string) {
		return this.locationRepository.findOne(locationId)
	}
}
