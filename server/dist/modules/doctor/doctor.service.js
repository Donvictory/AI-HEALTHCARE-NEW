"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
const axios_1 = __importDefault(require("axios"));
const app_error_util_1 = require("../../utils/app-error.util");
const doctor_entity_1 = require("./doctor.entity");
/**
 * Using the US Government's National Provider Identifier (NPI) Registry API as a real doctors endpoint.
 * Documentation: https://npiregistry.cms.hhs.gov/registry/help-api
 */
class DoctorService {
    get api() {
        return axios_1.default.create({
            baseURL: "https://npiregistry.cms.hhs.gov/api",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    // Helper to map an NPI registry result to our IDoctorEntity shape
    mapNpiToDoctor(provider) {
        const basic = provider.basic || {};
        const address = (provider.addresses || []).find((a) => a.address_purpose === "LOCATION") ||
            (provider.addresses || [])[0] ||
            {};
        const taxonomy = (provider.taxonomies || [])[0] || {};
        // Attempt to reverse map specialty, fallback to GENERAL_PRACTITIONER
        let matchedSpecialty = doctor_entity_1.Specialty.GENERAL_PRACTITIONER;
        const desc = taxonomy.desc?.toLowerCase() || "";
        if (desc.includes("cardio"))
            matchedSpecialty = doctor_entity_1.Specialty.CARDIOLOGIST;
        else if (desc.includes("derm"))
            matchedSpecialty = doctor_entity_1.Specialty.DERMATOLOGIST;
        else if (desc.includes("neuro"))
            matchedSpecialty = doctor_entity_1.Specialty.NEUROLOGIST;
        else if (desc.includes("pediatr"))
            matchedSpecialty = doctor_entity_1.Specialty.PEDIATRICIAN;
        else if (desc.includes("psychi"))
            matchedSpecialty = doctor_entity_1.Specialty.PSYCHIATRIST;
        else if (desc.includes("dentist"))
            matchedSpecialty = doctor_entity_1.Specialty.DENTIST;
        return {
            _id: String(provider.number),
            name: `${basic.first_name || ""} ${basic.last_name || ""} ${basic.credential ? ", " + basic.credential : ""}`.trim(),
            specialty: matchedSpecialty,
            hospitalOrClinic: basic.organization_name || `${basic.last_name || "Medical"} Clinic`,
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
    async create(data) {
        throw new app_error_util_1.AppError(`External API (NPI Registry) is read-only`, 403);
    }
    async getAll(query = {}) {
        try {
            const params = { version: "2.1", limit: 50 };
            if (query.city)
                params.city = query.city;
            if (query.state)
                params.state = query.state.substring(0, 2).toUpperCase(); // NPI strictly requires 2-letter state code
            const response = await this.api.get("/", { params });
            return (response.data.results || []).map(this.mapNpiToDoctor);
        }
        catch (error) {
            throw new app_error_util_1.AppError(`External API Error: ${error.message}`, 500);
        }
    }
    async getById(id) {
        try {
            const response = await this.api.get("/", {
                params: { version: "2.1", number: id },
            });
            const results = response.data.results || [];
            if (!results.length)
                throw new app_error_util_1.AppError("Doctor not found in NPI registry", 404);
            return this.mapNpiToDoctor(results[0]);
        }
        catch (error) {
            if (error.statusCode === 404)
                throw error;
            throw new app_error_util_1.AppError(`External API Error: ${error.message}`, 500);
        }
    }
    async update(id, data) {
        throw new app_error_util_1.AppError(`External API (NPI Registry) is read-only`, 403);
    }
    async delete(id) {
        throw new app_error_util_1.AppError(`External API (NPI Registry) is read-only`, 403);
    }
    // ─── Location-based search ────────────────────────────────────────────────
    async findNearby(state, city, specialty) {
        if (!state)
            throw new app_error_util_1.AppError("User location (state) not set on your profile. Please update your profile first.", 400);
        try {
            const params = { version: "2.1", limit: 20 };
            // NPI strictly requires 2-letter state abbreviations (e.g. CA, NY)
            params.state = state.substring(0, 2).toUpperCase();
            if (city)
                params.city = city.toUpperCase();
            // Attempt to map specialty enum back to taxonomy description search wildcard
            if (specialty) {
                if (specialty === doctor_entity_1.Specialty.CARDIOLOGIST)
                    params.taxonomy_description = "Cardio*";
                else if (specialty === doctor_entity_1.Specialty.DERMATOLOGIST)
                    params.taxonomy_description = "Dermatolog*";
                else if (specialty === doctor_entity_1.Specialty.NEUROLOGIST)
                    params.taxonomy_description = "Neurolog*";
            }
            const response = await this.api.get("/", { params });
            return (response.data.results || []).map(this.mapNpiToDoctor);
        }
        catch (error) {
            throw new app_error_util_1.AppError(`External API Error: ${error.message}`, 500);
        }
    }
}
exports.DoctorService = DoctorService;
