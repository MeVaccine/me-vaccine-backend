import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from 'src/appointment/appointment.module'
import { PersonModule } from 'src/person/person.module'
import { User, UserSchema } from 'src/schema/User.schema'
import { SymptomController } from './symptom.controller'
import { SymptomService } from './symptom.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), AppointmentModule, PersonModule],
	controllers: [SymptomController],
	providers: [SymptomService],
})
export class SymptomModule {}
