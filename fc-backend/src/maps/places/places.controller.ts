import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from 'src/maps/places/places.service';

@Controller('places')
export class PlacesController {
    constructor(private placesService: PlacesService){

    }

	@Get()
	findPlace(@Query('text') text: string) {
        return this.placesService.findPlace(text);
    }
}
