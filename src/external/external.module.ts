import { Module } from '@nestjs/common'
import { AppointmentModule } from 'src/appointment/appointment.module'
import { LocationModule } from 'src/location/location.module'
import { UserModule } from 'src/user/user.module'
import { VaccineModule } from 'src/vaccine/vaccine.module'
import { ExternalController } from './external.controller'

@Module({
	imports: [AppointmentModule, LocationModule, VaccineModule, UserModule],
	controllers: [ExternalController],
})
export class ExternalModule {}
