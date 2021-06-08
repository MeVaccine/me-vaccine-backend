import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiService } from 'src/api/api.service'
import { UserService } from './user.service'
import { NationalInfoQueryDto } from '../api/dto/national-id-query.dto'

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(private userService: UserService, private apiService: ApiService) {}

	@Get('/nationalInfo')
	@ApiOperation({ summary: 'Get user info from external national API' })
	@ApiOkResponse({ type: NationalInfoQueryDto })
	@ApiResponse({ status: 400, description: 'Not Found' })
	@ApiResponse({ status: 404, description: 'LaserID and/or natioalID is/are in wrong format' })
	async getPersonalInfo(@Query('nationalID') nationalID: string, @Query('laserID') laserID: string) {
		return this.apiService.searchByNationalID(nationalID, laserID)
	}
}
