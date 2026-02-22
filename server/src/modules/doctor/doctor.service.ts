import DoctorModel, { IDoctor } from "./doctor.model";
import { AppError } from "../../utils/app-error.util";
import {
  CreateDoctorDto,
  FindDoctorsQuery,
  UpdateDoctorDto,
} from "./doctor.dto";

export class DoctorService {
  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async create(data: CreateDoctorDto): Promise<IDoctor> {
    // Normalise location to lowercase for consistent matching
    return DoctorModel.create({
      ...data,
      state: data.state.toLowerCase(),
      city: data.city.toLowerCase(),
    });
  }

  async getAll(query: FindDoctorsQuery = {}): Promise<IDoctor[]> {
    const filter: Record<string, any> = {};
    if (query.state) filter.state = query.state.toLowerCase();
    if (query.city) filter.city = query.city.toLowerCase();
    if (query.specialty) filter.specialty = query.specialty;
    if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable;

    return DoctorModel.find(filter).sort({ rating: -1, name: 1 }).lean();
  }

  async getById(id: string): Promise<IDoctor> {
    const doctor = await DoctorModel.findById(id).lean();
    if (!doctor) throw new AppError("Doctor not found", 404);
    return doctor;
  }

  async update(id: string, data: UpdateDoctorDto): Promise<IDoctor> {
    const payload: Record<string, any> = { ...data };
    if (data.state) payload.state = data.state.toLowerCase();
    if (data.city) payload.city = data.city.toLowerCase();

    const doctor = await DoctorModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();
    if (!doctor) throw new AppError("Doctor not found", 404);
    return doctor;
  }

  async delete(id: string): Promise<void> {
    const doctor = await DoctorModel.findByIdAndDelete(id).lean();
    if (!doctor) throw new AppError("Doctor not found", 404);
  }

  // ─── Location-based search ────────────────────────────────────────────────

  /**
   * Find doctors near the user by matching their state (and optionally city).
   * Falls back to state-only if no city-level results are found.
   */
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

    const filter: Record<string, any> = {
      state: state.toLowerCase(),
      isAvailable: true,
    };
    if (specialty) filter.specialty = specialty;

    // Try city-level first
    if (city) {
      const cityResults = await DoctorModel.find({
        ...filter,
        city: city.toLowerCase(),
      })
        .sort({ rating: -1, name: 1 })
        .lean();
      if (cityResults.length > 0) return cityResults;
    }

    // Fallback: whole state
    return DoctorModel.find(filter).sort({ rating: -1, name: 1 }).lean();
  }
}
