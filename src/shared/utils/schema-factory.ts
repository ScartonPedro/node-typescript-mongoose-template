import { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';

export default (definition: SchemaDefinition, options?: SchemaOptions) => {
  const schema = new Schema(
    {
      deleted: { type: Boolean, default: false },
      enabled: { type: Boolean, default: true },
      ...definition,
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
      minimize: false,
      ...options,
    }
  );
  schema.index({ deleted: 1 });
  schema.index({ enabled: 1 });
  schema.index({ createdAt: 1 });
  schema.index({ updatedAt: 1 });
  return schema;
};
