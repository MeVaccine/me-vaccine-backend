import { NotFoundException, PipeTransform } from '@nestjs/common'
import { Location } from 'src/entity/Location.entity'
import { LocationService } from './location.service'

export class LocationValidationPipe implements PipeTransform<string, Promise<Location>> {
	constructor(private locationService: LocationService) {}

	async transform(id: string) {
		const location = await this.locationService.findById(id)
		if (!location) throw new NotFoundException('Location is not found')
		return location
	}
}
