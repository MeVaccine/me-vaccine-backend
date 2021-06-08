import { Body, Controller, Get, NotFoundException, Patch, UseGuards } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'
import { ChangePreferedLocationDto } from './dto/change-prefered-location.dto'
import { PreferedLocationDto } from './dto/prefered-location.dto'
import { LocationService } from './location.service'

@Controller('location')
@ApiTags('Location')
export class LocationController {
	constructor(private userService: UserService, private locationService: LocationService) {}

	@Get('prefered')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user current prefered location' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: PreferedLocationDto })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async getPreferedLocation(@User() user: UserDocument) {
		return this.userService.getPreferedLocationWithoutDatetime(user._id)
	}

	@Patch('prefered')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Change prefered location of user and all person' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: PreferedLocationDto })
	@ApiNotFoundResponse({ description: 'Location not found' })
	@ApiBadRequestResponse({ description: 'locationId is not valid a Mongo ObjectId' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async changePreferLocation(@User() user: UserDocument, @Body() { locationId }: ChangePreferedLocationDto) {
		const location = await this.locationService.findById(locationId)
		if (!location) throw new NotFoundException()
		await this.userService.changePreferedLocation(user._id, location)
		return this.userService.getPreferedLocationWithoutDatetime(user._id)
	}
}
