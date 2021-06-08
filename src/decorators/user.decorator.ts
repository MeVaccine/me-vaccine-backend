import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserDocument } from 'src/schema/User.schema'

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): Promise<UserDocument> => {
	const request = ctx.switchToHttp().getRequest()
	return request.user
})
