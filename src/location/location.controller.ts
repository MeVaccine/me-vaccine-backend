import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { UserDocument } from 'src/schema/User.schema'
import { UserService } from 'src/user/user.service'
import { PreferedLocationDto } from './dto/prefered-location.dto'

@Controller('location')
@ApiTags('Location')
export class LocationController {
	constructor(private userService: UserService) {}

	@Get('prefered')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Get user current prefered location' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: PreferedLocationDto })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
	async getPreferedLocation(@User() user: UserDocument) {
		return this.userService.getPreferedLocationWithoutDatetime(user._id)
	}
}
