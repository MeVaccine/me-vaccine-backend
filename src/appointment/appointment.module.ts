import { Module } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { AppointmentController } from './appointment.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schema/User.schema'
import { LocationModule } from 'src/location/location.module'
import { PersonModule } from 'src/person/person.module'
import { Vaccine, VaccineSchema } from 'src/schema/Vaccine.schema'
import { VaccineModule } from 'src/vaccine/vaccine.module'
import { UserModule } from 'src/user/user.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Vaccine.name, schema: VaccineSchema },
		]),
		LocationModule,
		PersonModule,
		VaccineModule,
		UserModule,
	],
	providers: [AppointmentService],
	controllers: [AppointmentController],
})
export class AppointmentModule {}
