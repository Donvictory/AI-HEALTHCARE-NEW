import axios from "axios";
import { AppError } from "../../utils/app-error.util";
import { appConfig } from "../../config/app.config";
import {
  CreateDoctorDto,
  FindDoctorsQuery,
  UpdateDoctorDto,
} from "./doctor.dto";
import { IDoctor } from "./doctor.model";

export class DoctorService {
  private get api() {
    return axios.create({
      baseURL: appConfig.doctors.apiUrl,
      headers: {
        Authorization: `Bearer ${appConfig.doctors.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async create(data: CreateDoctorDto): Promise<IDoctor> {
    try {
      const response = await this.api.post("/doctors", data);
      return response.data;
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async getAll(query: FindDoctorsQuery = {}): Promise<IDoctor[]> {
    try {
      const response = await this.api.get("/doctors", { params: query });
      return response.data;
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async getById(id: string): Promise<IDoctor> {
    try {
      const response = await this.api.get(`/doctors/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new AppError("Doctor not found", 404);
      }
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async update(id: string, data: UpdateDoctorDto): Promise<IDoctor> {
    try {
      const response = await this.api.patch(`/doctors/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.api.delete(`/doctors/${id}`);
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  // ─── Location-based search ────────────────────────────────────────────────

  async findNearby(
    state: string,
    city?: string,
    specialty?: string,
  ): Promise<IDoctor[]> {
    if (!state)
      throw new AppError(
        "User location (state) not set on your profile. Please update your profile first.",
        400,
      );

    try {
      // First try proxying to a generic nearby endpoint
      const response = await this.api.get("/doctors/nearby", {
        params: { state, city, specialty },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status !== 404) {
        throw new AppError(`External API Error: ${error.message}`, 500);
      }
      // If the external API doesn't have a /nearby endpoint, fallback to basic filtering on /doctors
      try {
        const query: any = { state, isAvailable: true };
        if (specialty) query.specialty = specialty;
        if (city) query.city = city;

        const fallbackResponse = await this.api.get("/doctors", {
          params: query,
        });
        return fallbackResponse.data;
      } catch (fallbackError: any) {
        throw new AppError(
          `External API fallback Error: ${fallbackError.message}`,
          500,
        );
      }
    }
  }
}
