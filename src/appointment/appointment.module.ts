import { Module } from '@nestjs/common'
import { AppointmentService } from './appointment.service'
import { AppointmentController } from './appointment.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schema/User.schema'
import { LocationModule } from 'src/location/location.module'
import { PersonModule } from 'src/person/person.module'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), LocationModule, PersonModule],
	providers: [AppointmentService],
	controllers: [AppointmentController],
})
export class AppointmentModule {}
