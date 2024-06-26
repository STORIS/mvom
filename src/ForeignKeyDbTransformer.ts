// #region Types
export interface ForeignKeyDefinition {
	file: string | string[];
	keysToIgnore?: string[];
	entityName: string;
}

type PositionForeignKeyDefinition = Record<number, ForeignKeyDefinition>;

export type CompoundForeignKeyDefinition = PositionForeignKeyDefinition & {
	splitCharacter: string;
};

export interface ForeignKeyDbDefinition {
	filename: string | string[];
	entityId: string;
	entityName: string;
}
// #endregion

class ForeignKeyDbTransformer {
	private readonly foreignKeyDefinition: ForeignKeyDefinition | CompoundForeignKeyDefinition | null;

	public constructor(
		foreignKeyDefinition: ForeignKeyDefinition | CompoundForeignKeyDefinition | null = null,
	) {
		this.foreignKeyDefinition = foreignKeyDefinition;
	}

	/** Transform schema foreign key definitions to the format required by the db server */
	public transform = (value: unknown): ForeignKeyDbDefinition[] => {
		if (typeof value !== 'string' || this.foreignKeyDefinition == null) {
			return [];
		}

		if (this.isCompoundForeignKeyDefinition(this.foreignKeyDefinition)) {
			// destructuring here because otherwise the TS compiler does not recognize that this type has been narrowed in the reduce loop
			const { foreignKeyDefinition } = this;
			const { splitCharacter } = foreignKeyDefinition;

			// If the splitCharacter is not found in the id the foreign key validation will probably fail.
			// This error may be picked up by a match validator or could indicate a programming error
			const values = value.split(splitCharacter);
			return values.reduce<ForeignKeyDbDefinition[]>((acc, entityId, index) => {
				const foreignKeyDefs = foreignKeyDefinition[index];
				if (foreignKeyDefs == null) {
					return acc;
				}

				const { file, keysToIgnore = [], entityName } = foreignKeyDefs;
				if (keysToIgnore.includes(entityId)) {
					return acc;
				}

				acc.push({ filename: file, entityId, entityName });

				return acc;
			}, []);
		}

		const { file, keysToIgnore = [], entityName } = this.foreignKeyDefinition;

		if (keysToIgnore.includes(value)) {
			return [];
		}

		return [
			{
				filename: file,
				entityId: value,
				entityName,
			},
		];
	};

	private isCompoundForeignKeyDefinition(
		definition: ForeignKeyDefinition | CompoundForeignKeyDefinition,
	): definition is CompoundForeignKeyDefinition {
		return 'splitCharacter' in definition;
	}
}

export default ForeignKeyDbTransformer;
