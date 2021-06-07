import {
	BadRequestException,
	HttpService,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NationalIDQueryDto } from './dto/national-id-query.dto'

@Injectable()
export class ApiService {
	constructor(private configService: ConfigService, private httpService: HttpService) {}

	async searchByNationalID(nationalID: string, laserID: string): Promise<NationalIDQueryDto> {
		try {
			const baseUrl = this.configService.get<string>('NATIONAL_EXTERNAL_API_URL')
			const res = await this.httpService
				.get(`${baseUrl}/nationid`, {
					params: { id: nationalID, laserID },
				})
				.toPromise()
			return res.data
		} catch (error) {
			const errorStatus = error.response.status
			if (errorStatus === 400) {
				throw new BadRequestException()
			} else if (errorStatus === 404) {
				throw new NotFoundException()
			}
			throw new InternalServerErrorException()
		}
	}
}
