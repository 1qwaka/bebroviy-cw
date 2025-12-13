export interface PaginationModel<Entity> {
    page: number,
    pageSize: number,
    totalElements: number,
    items: Entity[],
}