import { Model, Document, UpdateQuery } from "mongoose";

export class MongooseRepository<T> {
  private model: Model<T & Document>;

  constructor(model: Model<T & Document>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    await doc.save();
    return doc.toObject();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean();
  }

  async findOne(query: Record<string, any>): Promise<T | null> {
    return this.model.findOne(query).lean();
  }

  async findMany(query: Record<string, any>): Promise<T[]> {
    return this.model.find(query).lean();
  }

  async updateById(id: string, data: any): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean();
  }

  async deleteMany(query: Record<string, any>): Promise<any> {
    return this.model.deleteMany(query);
  }
}
