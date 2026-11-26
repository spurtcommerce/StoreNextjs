/**
 * Canonical CommonBannerItem DTO
 * Follows the shape expected by templates (Default, Aurora, Studio, Wellpoint, Horizon)
 * and Spurt/Medusa storefront implementations.
 */

export function createCommonBannerItem(partial = {}) {
  const bannerId = partial.bannerId || partial.id || 1;
  const title = partial.title || "";
  const content = partial.content || partial.description || "";
  const link = partial.link || "";
  const position = Number(partial.position || partial.sortOrder || 1);
  const image = partial.image || "";
  const imagePath = partial.imagePath || "";
  const imageName = partial.imageName || image || "";
  const containerName = partial.containerName || "";

  const bannerImages =
    Array.isArray(partial.bannerImages) && partial.bannerImages.length > 0
      ? partial.bannerImages
      : [
          {
            imagePath,
            imageName,
            containerName,
          },
        ];

  return {
    bannerId,
    id: bannerId,
    title,
    content,
    link,
    position,
    image,
    imagePath,
    imageName,
    containerName,
    bannerImages,
    status: partial.status !== undefined ? Number(partial.status) : 1,
  };
}

export function createCommonBannerListResponse(partial = {}) {
  const status = partial.status !== undefined ? Number(partial.status) : 1;
  const message = partial.message || "Banners fetched successfully";
  const data = Array.isArray(partial.data) ? partial.data : [];

  return {
    status,
    message,
    data,
    total: partial.total ?? data.length,
  };
}

export default createCommonBannerItem;

