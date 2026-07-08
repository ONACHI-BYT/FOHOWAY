// Tìm SP theo urlSlug, hoặc theo id nếu chuỗi đúng dạng UUID (tránh Prisma ép UUID lỗi).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function productSlugWhere(slugOrId: string) {
  return UUID_RE.test(slugOrId)
    ? [{ urlSlug: slugOrId }, { id: slugOrId }]
    : [{ urlSlug: slugOrId }];
}
