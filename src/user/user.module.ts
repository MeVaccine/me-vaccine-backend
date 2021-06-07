import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { User, UserSchema } from 'src/schema/User.schema'
import { ApiModule } from 'src/api/api.module'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
	imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), ApiModule],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
