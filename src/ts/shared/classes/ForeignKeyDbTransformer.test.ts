import ForeignKeyDbTransformer from './ForeignKeyDbTransformer';
import type {
	ForeignKeyDefinition,
	CompoundForeignKeyDefinition,
	ForeignKeyDbDefinition,
} from './ForeignKeyDbTransformer';

describe('transform', () => {
	test('should return an empty array if foreign key definitions are provided', () => {
		const expected: ForeignKeyDbDefinition[] = [];
		const fkTransformer = new ForeignKeyDbTransformer(null);
		expect(fkTransformer.transform('id1')).toEqual(expected);
	});

	describe('simple', () => {
		const entityId = 'entityId';

		test('should return an empty array if no values are given', () => {
			const defs: ForeignKeyDefinition = {
				file: 'file',
				entityName: 'entityName',
			};
			const expected: ForeignKeyDbDefinition[] = [];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(null)).toEqual(expected);
		});

		test('should return the value in db fk defs if no keys are specified to be ignored', () => {
			const defs: ForeignKeyDefinition = {
				file: 'file',
				entityName: 'entityName',
			};

			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file',
					entityIds: entityId,
					entityName: 'entityName',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return an empty array if the id is one of the keys to be ignored', () => {
			const defs: ForeignKeyDefinition = {
				file: 'file',
				entityName: 'entityName',
				keysToIgnore: [entityId, 'entityId2-noMatch'],
			};

			const expected: ForeignKeyDbDefinition[] = [];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return the value in db fk defs if the value does not match any of the ignore characters', () => {
			const defs: ForeignKeyDefinition = {
				file: 'file',
				entityName: 'entityName',
				keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
			};

			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file',
					entityIds: entityId,
					entityName: 'entityName',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});
	});

	describe('compound', () => {
		const entityId = 'entityId*1';

		test('should return an empty array if no values are given', () => {
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file',
					entityName: 'entityName',
				},
			};
			const expected: ForeignKeyDbDefinition[] = [];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(null)).toEqual(expected);
		});

		test('should return the db fk definitions for the split id if no keys to ignore a specified', () => {
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file',
					entityName: 'entityName',
				},
			};
			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file',
					entityIds: 'entityId',
					entityName: 'entityName',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return the db fk definitions for the id if the split character is not found in the string', () => {
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '|',
				0: {
					file: 'file',
					entityName: 'entityName',
				},
			};
			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file',
					entityIds: entityId,
					entityName: 'entityName',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return an empty string if the split id is found in the list of keys to ignore', () => {
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file',
					entityName: 'entityName',
					keysToIgnore: ['entityId', 'entityId2-noMatch'],
				},
			};
			const expected: ForeignKeyDbDefinition[] = [];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return the db fk definitions for the split id it does not match any keys to ignore', () => {
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file',
					entityName: 'entityName',
					keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
				},
			};
			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file',
					entityIds: 'entityId',
					entityName: 'entityName',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(entityId)).toEqual(expected);
		});

		test('should return multiple db fk definitions compound ids that have multiple foreign keys', () => {
			const compoundEntityId = 'entityId0*1*entityId2';
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file0',
					entityName: 'entityName0',
					keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
				},
				2: {
					file: 'file2',
					entityName: 'entityName2',
					keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
				},
			};
			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file0',
					entityIds: 'entityId0',
					entityName: 'entityName0',
				},
				{
					filename: 'file2',
					entityIds: 'entityId2',
					entityName: 'entityName2',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(compoundEntityId)).toEqual(expected);
		});

		test('should filter out compound ids using independent lists of keys to ignore', () => {
			const compoundEntityId = 'entityId0*entityId1*entityId2';
			const defs: CompoundForeignKeyDefinition = {
				splitCharacter: '*',
				0: {
					file: 'file0',
					entityName: 'entityName0',
					keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
				},
				1: {
					file: 'file1',
					entityName: 'entityName1',
					keysToIgnore: ['entityId1'],
				},
				2: {
					file: 'file2',
					entityName: 'entityName2',
					keysToIgnore: ['entityId1-noMatch', 'entityId2-noMatch'],
				},
			};
			const expected: ForeignKeyDbDefinition[] = [
				{
					filename: 'file0',
					entityIds: 'entityId0',
					entityName: 'entityName0',
				},
				{
					filename: 'file2',
					entityIds: 'entityId2',
					entityName: 'entityName2',
				},
			];
			const fkTransformer = new ForeignKeyDbTransformer(defs);
			expect(fkTransformer.transform(compoundEntityId)).toEqual(expected);
		});
	});
});
