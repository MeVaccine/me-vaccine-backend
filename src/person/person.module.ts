import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiModule } from 'src/api/api.module'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { User, UserSchema } from 'src/schema/User.schema'
import { UserModule } from 'src/user/user.module'
import { PersonController } from './person.controller'
import { PersonService } from './person.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ApiModule, UserModule],
	controllers: [PersonController],
	providers: [ PersonService],
})
export class PersonModule {}
