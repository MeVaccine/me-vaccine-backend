import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Location, LocationDocument } from 'src/schema/Location.schema'

@Injectable()
export class LocationService {
	constructor(@InjectModel(Location.name) private locationModel: Model<LocationDocument>) {}

	findById(locationId: string) {
		return this.locationModel.findOne({ _id: locationId }).exec()
	}
}
