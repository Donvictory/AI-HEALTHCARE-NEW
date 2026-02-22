import axios from "axios";
import { AppError } from "../../utils/app-error.util";
import { appConfig } from "../../config/app.config";
import {
  CreateDoctorDto,
  FindDoctorsQuery,
  UpdateDoctorDto,
} from "./doctor.dto";
import { IDoctorEntity, Specialty } from "./doctor.entity";

/**
 * Using the US Government's National Provider Identifier (NPI) Registry API as a real doctors endpoint.
 * Documentation: https://npiregistry.cms.hhs.gov/registry/help-api
 */
export class DoctorService {
  private get api() {
    return axios.create({
      baseURL: "https://npiregistry.cms.hhs.gov/api",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Helper to map an NPI registry result to our IDoctorEntity shape
  private mapNpiToDoctor(provider: any): IDoctorEntity {
    const basic = provider.basic || {};
    const address =
      (provider.addresses || []).find(
        (a: any) => a.address_purpose === "LOCATION",
      ) ||
      (provider.addresses || [])[0] ||
      {};
    const taxonomy = (provider.taxonomies || [])[0] || {};

    // Attempt to reverse map specialty, fallback to GENERAL_PRACTITIONER
    let matchedSpecialty = Specialty.GENERAL_PRACTITIONER;
    const desc = taxonomy.desc?.toLowerCase() || "";
    if (desc.includes("cardio")) matchedSpecialty = Specialty.CARDIOLOGIST;
    else if (desc.includes("derm")) matchedSpecialty = Specialty.DERMATOLOGIST;
    else if (desc.includes("neuro")) matchedSpecialty = Specialty.NEUROLOGIST;
    else if (desc.includes("pediatr"))
      matchedSpecialty = Specialty.PEDIATRICIAN;
    else if (desc.includes("psychi")) matchedSpecialty = Specialty.PSYCHIATRIST;
    else if (desc.includes("dentist")) matchedSpecialty = Specialty.DENTIST;

    return {
      _id: String(provider.number),
      name: `${basic.first_name || ""} ${basic.last_name || ""} ${basic.credential ? ", " + basic.credential : ""}`.trim(),
      specialty: matchedSpecialty,
      hospitalOrClinic:
        basic.organization_name || `${basic.last_name || "Medical"} Clinic`,
      state: address.state || "Unknown",
      city: address.city || "Unknown",
      address: address.address_1,
      isAvailable: true,
      bio: `NPI Registered Provider. Taxonomy: ${taxonomy.desc || "Unknown"}`,
      yearsOfExperience: Math.floor(Math.random() * 20) + 1, // Simulated
      rating: Number((Math.random() * 2 + 3).toFixed(1)), // Simulated between 3-5
      consultationFee: Math.floor(Math.random() * 200) + 50, // Simulated
    };
  }

  // ─── Admin CRUD (Mocked as external API is read-only) ─────────────────────────

  async create(data: CreateDoctorDto): Promise<any> {
    throw new AppError(`External API (NPI Registry) is read-only`, 403);
  }

  async getAll(query: FindDoctorsQuery = {}): Promise<IDoctorEntity[]> {
    try {
      const params: any = { version: "2.1", limit: 50 };
      if (query.city) params.city = query.city;
      if (query.state) params.state = query.state.substring(0, 2).toUpperCase(); // NPI strictly requires 2-letter state code

      const response = await this.api.get("/", { params });
      return (response.data.results || []).map(this.mapNpiToDoctor);
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async getById(id: string): Promise<IDoctorEntity> {
    try {
      const response = await this.api.get("/", {
        params: { version: "2.1", number: id },
      });
      const results = response.data.results || [];
      if (!results.length)
        throw new AppError("Doctor not found in NPI registry", 404);

      return this.mapNpiToDoctor(results[0]);
    } catch (error: any) {
      if (error.statusCode === 404) throw error;
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }

  async update(id: string, data: UpdateDoctorDto): Promise<any> {
    throw new AppError(`External API (NPI Registry) is read-only`, 403);
  }

  async delete(id: string): Promise<void> {
    throw new AppError(`External API (NPI Registry) is read-only`, 403);
  }

  // ─── Location-based search ────────────────────────────────────────────────

  async findNearby(
    state: string,
    city?: string,
    specialty?: string,
  ): Promise<IDoctorEntity[]> {
    if (!state)
      throw new AppError(
        "User location (state) not set on your profile. Please update your profile first.",
        400,
      );

    try {
      const params: any = { version: "2.1", limit: 20 };

      // NPI strictly requires 2-letter state abbreviations (e.g. CA, NY)
      params.state = state.substring(0, 2).toUpperCase();
      if (city) params.city = city.toUpperCase();

      // Attempt to map specialty enum back to taxonomy description search wildcard
      if (specialty) {
        if (specialty === Specialty.CARDIOLOGIST)
          params.taxonomy_description = "Cardio*";
        else if (specialty === Specialty.DERMATOLOGIST)
          params.taxonomy_description = "Dermatolog*";
        else if (specialty === Specialty.NEUROLOGIST)
          params.taxonomy_description = "Neurolog*";
      }

      const response = await this.api.get("/", { params });
      return (response.data.results || []).map(this.mapNpiToDoctor);
    } catch (error: any) {
      throw new AppError(`External API Error: ${error.message}`, 500);
    }
  }
}
