import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ApiService } from 'src/api/api.service'
import { User } from 'src/entity/User.entity'
import { RegisNewUserDto } from './dto/regis-new-user.dto'
import { UserService } from './user.service'

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(private userService: UserService, private apiService: ApiService) {}

	@Get('/nationalInfo')
	@ApiOperation({ summary: 'Get user info from external national API' })
	@ApiResponse({ status: 400, description: 'Not Found' })
	@ApiResponse({ status: 404, description: 'LaserID and/or natioalID is/are in wrong format' })
	async getPersonalInfo(@Query('nationalID') nationalID: string, @Query('laserID') laserID: string) {
		return this.apiService.searchByNationalID(nationalID, laserID)
	}

	@Post('regis')
	@ApiOperation({ summary: 'Register new user' })
	@ApiResponse({ status: 201, description: 'The User information', type: User })
	@ApiResponse({ status: 400 })
	async registerNewUser(@Body() regisNewUserDto: RegisNewUserDto) {
		const personData = await this.apiService.searchByNationalID(regisNewUserDto.nationalID, regisNewUserDto.laserID)
		const existingUser = await this.userService.findByNationalID(regisNewUserDto.nationalID)
		if (existingUser) {
			throw new BadRequestException('User already register')
		}
		return this.userService.createUser(personData, regisNewUserDto.phoneNumber)
	}
}
