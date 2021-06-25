import { Module } from '@nestjs/common'
import { AppointmentModule } from 'src/appointment/appointment.module'
import { LocationModule } from 'src/location/location.module'
import { ExternalController } from './external.controller'

@Module({
	imports: [AppointmentModule, LocationModule],
	controllers: [ExternalController],
})
export class ExternalModule {}
