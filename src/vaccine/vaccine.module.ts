import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Vaccine, VaccineSchema } from 'src/schema/Vaccine.schema'
import { UserModule } from 'src/user/user.module'
import { VaccineService } from './vaccine.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Vaccine.name, schema: VaccineSchema }]), UserModule],
	providers: [VaccineService],
	exports: [VaccineService],
})
export class VaccineModule {}
