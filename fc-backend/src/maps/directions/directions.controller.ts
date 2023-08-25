import { Controller, Get, Query } from '@nestjs/common';
import { DirectionsService } from 'src/maps/directions/directions.service';

@Controller('directions')
export class DirectionsController {
	constructor(private placesService: DirectionsService) {}

	@Get()
	getDirections(
		@Query('originId') originId: string,
		@Query('destinationId') destinationId: string,
	) {
		return this.placesService.getDirections(originId, destinationId);
	}
}
