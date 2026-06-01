import type { Request, Response } from "express";
import { GooglePlacesValidator } from "./googlePlaces.validation.js";
import { GooglePlacesService } from "./googlePlaces.service.js";

export class GooglePlacesController {
  private validator = new GooglePlacesValidator();
  private service = new GooglePlacesService();

  agroNearby = async (req: Request, res: Response) => {
    const validation = this.validator.validateNearestAgroQuery(req.query);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const latitude = Number(validation.payload.lat);
    const longitude = Number(validation.payload.lng);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({
        errors: ["lat and lng must be valid numbers"],
      });
    }

    try {
      const nearestAgro = await this.service.findNearestAgro({
        latitude,
        longitude,
      });
      return res.json({ nearestAgro });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };

  nearestAgro = async (req: Request, res: Response) => {
    const validation = this.validator.validateNearestAgro(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const nearestAgro = await this.service.findNearestAgro(
        validation.payload,
      );
      return res.json({ nearestAgro });
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  };
}

const controller = new GooglePlacesController();
export const agroNearby = controller.agroNearby.bind(controller);
export const nearestAgro = controller.nearestAgro.bind(controller);
