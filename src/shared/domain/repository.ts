export interface Repository<Entity, Id = string> {
  findById(id: Id): Promise<Entity | null>;
  save(entity: Entity): Promise<void>;
  delete(id: Id): Promise<void>;
}
