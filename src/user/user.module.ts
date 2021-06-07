import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/schema/User.schema'
import { ApiModule } from 'src/api/api.module'
import { LocationModule } from 'src/location/location.module'

@Module({
	imports: [TypeOrmModule.forFeature([User]), ApiModule, LocationModule],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
