import { PostModel } from "@/lib/db/models/Post";
import { ProjectModel } from "@/lib/db/models/Project";

/**
 * Featured is exclusive within each content type: one featured post and one
 * featured project can exist at the same time. Starring an item removes the
 * star only from other items of the same type.
 */
export async function clearFeaturedExcept(
  kind: "post" | "project",
  id: string,
): Promise<void> {
  // `timestamps: false` keeps the other items' updatedAt untouched, so the newly
  // starred item stays on top of the updatedAt-sorted admin lists.
  if (kind === "post") {
    await PostModel.updateMany(
      { _id: { $ne: id }, featured: true },
      { featured: false },
      { timestamps: false },
    );
  } else {
    await ProjectModel.updateMany(
      { _id: { $ne: id }, featured: true },
      { featured: false },
      { timestamps: false },
    );
  }
}
