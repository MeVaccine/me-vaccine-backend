import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Put,
	Query,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
	ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User } from 'src/decorators/user.decorator'
import { LocationService } from 'src/location/location.service'
import { PersonService } from 'src/person/person.service'
import { Appointment } from 'src/schema/Appointment.schema'
import { UserDocument } from 'src/schema/User.schema'
import { Vaccine, VaccineDocument } from 'src/schema/Vaccine.schema'
import { UserService } from 'src/user/user.service'
import { VaccineService } from 'src/vaccine/vaccine.service'
import { AppointmentService } from './appointment.service'
import { AppointmentQueryResponse } from './dto/appointment-query-res.dto'
import { NewAppointmentExceptionDto } from './dto/new-appointment-exception.dto'
import { NewAppointmentDto } from './dto/new-appointment.dto'
import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import { LandingInfoDto } from './dto/landing-info.dto'
dayjs.extend(utc)

@Controller('appointment')
@ApiTags('Appointment')
export class AppointmentController {
	constructor(
		private userService: UserService,
		private appointmentService: AppointmentService,
		private locationService: LocationService,
		private vaccineService: VaccineService,
		private personSerivce: PersonService
	) {}

	@Post('new')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Create new appointment' })
	@ApiBearerAuth('Authorization')
	@ApiCreatedResponse({ type: AppointmentQueryResponse, isArray: true })
	@ApiBadRequestResponse({ type: NewAppointmentExceptionDto })
	async makeNewAppointment(@User() user: UserDocument, @Body() data: NewAppointmentDto) {
		// Count number of vaccine needed
		const neededVaccine: Record<string, number> = {}
		data.person.forEach(el => {
			if (!neededVaccine[el.vaccine]) {
				neededVaccine[el.vaccine] = 1
			} else neededVaccine[el.vaccine] += 1
		})
		// Check if all the person select the suitable vaccine
		const vaccines = await this.vaccineService.checkVaccinePersonValidity(data.person)

		// Verify the location existant and avaliability
		const location = await this.locationService.findById(data.locationId)
		if (!location)
			throw new BadRequestException(
				new NewAppointmentExceptionDto('Location and/or dateTime and/or vaccube is not found', '')
			)
		await this.locationService.isValidForAppointment(data, neededVaccine)

		// Get UserDocument of every person
		const getUsersOps: Promise<UserDocument>[] = data.person.map(person => this.userService.findByID(person.id))
		const users = await Promise.all(getUsersOps)
		if (users.some(el => el === undefined))
			throw new BadRequestException(new NewAppointmentExceptionDto('Some or every User is not found', ''))

		// TODO: Findout dose number of each user
		const doesNumberOps: Promise<number>[] = data.person.map((person, index) =>
			this.appointmentService.getVaccineDoseNumber(person.id, vaccines[index])
		)
		const doseNumbers = await Promise.all(doesNumberOps)

		// Check that each person is really under user
		const isAllUnderUser = await this.personSerivce.isPersonsOfUser(user._id, users)
		if (!isAllUnderUser) throw new UnauthorizedException()

		// Create an appointment for each user
		const createAppointmentsOps: Promise<Appointment>[] = users.map((el, index) =>
			this.appointmentService.newAppointment(el, location, data.dateTime, vaccines[index], doseNumbers[index])
		)

		// Decrease number of vaccine and location capacity
		await this.locationService.decreaseNumberOfAvaliable(location, data.person.length, data.dateTime, neededVaccine)

		const appointments = await Promise.all(createAppointmentsOps)
		return appointments.map(el => {
			const appointment: any = { ...el }
			appointment.dateTime = dayjs(el.dateTime).utcOffset(7).format()
			appointment.location.dateTime = undefined
			appointment.location.vaccines = undefined
			return appointment
		})
	}

	@Put('vaccine')
	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@ApiOperation({ description: 'Get the vaccinable vaccine for each person' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({
		type: Vaccine,
		isArray: true,
		description: 'The actual response is array (person) of array of vaccine',
	})
	async getVaccinableVaccine(@Body() ids: string[]) {
		const ops: Promise<VaccineDocument[]>[] = ids.map(id => this.vaccineService.getVaccinableVaccine(id))
		return Promise.all(ops)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Get the appointment history' })
	@ApiBearerAuth('Authorization')
	@ApiParam({ name: 'id', required: false, description: 'The ID of person to query' })
	@ApiOkResponse({ type: AppointmentQueryResponse, isArray: true })
	@ApiUnauthorizedResponse({ description: 'JWT token is not present or querying user that not your person' })
	async getAppointments(@User() user: UserDocument, @Query('id') personId: string) {
		if (!personId || user._id === personId) return this.appointmentService.getAllAppointment(user._id)
		const person = await this.userService.findByID(personId)
		const isPersonsOfUser = await this.personSerivce.isPersonsOfUser(user._id, [person])
		if (!isPersonsOfUser) throw new UnauthorizedException('Your are querying user that not your person')
		return this.appointmentService.getAllAppointment(personId)
	}

	@Get('landing')
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ description: 'Get user next appointment and firstname for landing screen' })
	@ApiBearerAuth('Authorization')
	@ApiOkResponse({ type: LandingInfoDto })
	@ApiUnauthorizedResponse({ description: 'JWT token is not present or querying user that not your person' })
	async getNextAppointment(@User() user: UserDocument) {
		const nextAppointment = await this.appointmentService.getNextAppointment(user._id)
		return {
			firstname_th: user.firstname_th,
			firstname_en: user.firstname_en,
			appointment: nextAppointment,
		}
	}
}
