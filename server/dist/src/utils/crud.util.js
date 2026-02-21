"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseRepository = void 0;
class MongooseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const doc = new this.model(data);
        await doc.save();
        return doc.toObject();
    }
    async findById(id) {
        return this.model.findById(id).lean();
    }
    async findOne(query) {
        return this.model.findOne(query).lean();
    }
    async findMany(query) {
        return this.model.find(query).lean();
    }
    async updateById(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true }).lean();
    }
    async deleteById(id) {
        return this.model.findByIdAndDelete(id).lean();
    }
    async deleteMany(query) {
        return this.model.deleteMany(query);
    }
}
exports.MongooseRepository = MongooseRepository;
