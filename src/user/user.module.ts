import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entity/User.entity'
import { ApiModule } from 'src/api/api.module'

@Module({
	imports: [TypeOrmModule.forFeature([User]), ApiModule],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
