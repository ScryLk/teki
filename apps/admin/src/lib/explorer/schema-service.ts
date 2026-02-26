import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { MODEL_REGISTRY, getModelConfigOrFail } from './model-registry';
import type { ModelSummary } from './types';

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Returns metadata for all registered models (for the sidebar).
 */
export async function getRegisteredModels(): Promise<ModelSummary[]> {
  const results: ModelSummary[] = [];

  for (const config of MODEL_REGISTRY) {
    try {
      const delegate = (prisma as Record<string, unknown>)[toCamelCase(config.prismaModel)] as Record<string, Function>;
      if (!delegate?.count) continue;

      const count = await delegate.count(
        config.softDeleteField
          ? { where: { [config.softDeleteField]: null } }
          : undefined
      );

      results.push({
        prismaModel: config.prismaModel,
        displayName: config.displayName,
        icon: config.icon,
        category: config.category,
        description: config.description,
        recordCount: count as number,
      });
    } catch {
      // Model doesn't exist in current schema, skip
      results.push({
        prismaModel: config.prismaModel,
        displayName: config.displayName,
        icon: config.icon,
        category: config.category,
        description: config.description,
        recordCount: 0,
      });
    }
  }

  return results;
}

/**
 * Returns detailed schema for a model: fields, types, relations, config.
 */
export function getModelSchema(modelName: string) {
  const config = getModelConfigOrFail(modelName);
  const dmmf = Prisma.dmmf;
  const model = dmmf.datamodel.models.find((m) => m.name === config.prismaModel);
  if (!model) throw new Error('MODEL_NOT_FOUND');

  const fields = model.fields
    .filter((f) => !config.hiddenFields.includes(f.name))
    .map((f) => ({
      name: f.name,
      type: f.type,
      kind: f.kind,
      isList: f.isList,
      isRequired: f.isRequired,
      isId: f.isId,
      isUnique: f.isUnique,
      hasDefaultValue: f.hasDefaultValue,
      isReadOnly: config.readOnlyFields.includes(f.name),
      isMasked: config.maskedFields.includes(f.name),
      isEditable: config.editableFields?.includes(f.name) ?? false,
      relationName: f.relationName,
      documentation: f.documentation,
    }));

  const enums = model.fields
    .filter((f) => f.kind === 'enum')
    .map((f) => ({
      fieldName: f.name,
      values:
        dmmf.datamodel.enums
          .find((e) => e.name === f.type)
          ?.values.map((v) => v.name) || [],
    }));

  const relations = model.fields
    .filter((f) => f.kind === 'object')
    .map((f) => ({
      name: f.name,
      type: f.type,
      isList: f.isList,
      isExpandable: config.expandableRelations.includes(f.name),
      isInline: config.inlineRelations.includes(f.name),
    }));

  return {
    modelName: config.prismaModel,
    displayName: config.displayName,
    fields,
    enums,
    relations,
    config: {
      allowEdit: config.allowEdit,
      allowDelete: config.allowDelete,
      allowHardDelete: config.allowHardDelete,
      searchableFields: config.searchableFields,
      filters: config.filters,
      listColumns: config.listColumns,
      exportable: config.exportable,
    },
  };
}
