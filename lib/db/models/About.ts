import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import type { AboutContent, AboutInput } from "@/types/about";

export interface IAbout {
  intro: string;
  skills: { group: string; icon: string; items: string[] }[];
  journey: { year: string; title: string; body: string; featured: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

export type AboutDocument = HydratedDocument<IAbout>;

const AboutSchema = new Schema<IAbout>(
  {
    intro: { type: String, required: true },
    skills: {
      type: [
        new Schema(
          {
            group: { type: String, required: true },
            icon: { type: String, default: "build" },
            items: { type: [String], default: [] },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    journey: {
      type: [
        new Schema(
          {
            year: { type: String, required: true },
            title: { type: String, required: true },
            body: { type: String, required: true },
            featured: { type: Boolean, default: false },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
);

/** Plain, JSON-safe view of the (sub)documents for RSC/client transport. */
export function serializeAbout(
  doc: AboutDocument | (IAbout & { _id: unknown }),
): AboutContent {
  const obj = (
    typeof (doc as AboutDocument).toObject === "function"
      ? (doc as AboutDocument).toObject({ virtuals: false })
      : doc
  ) as IAbout & { _id: unknown };
  return {
    _id: String(obj._id),
    intro: obj.intro,
    skills: (obj.skills ?? []).map((s) => ({
      group: s.group,
      icon: s.icon,
      items: s.items ?? [],
    })),
    journey: (obj.journey ?? []).map((j) => ({
      year: j.year,
      title: j.title,
      body: j.body,
      featured: j.featured ?? false,
    })),
  };
}

export const AboutModel: Model<IAbout> =
  (mongoose.models.About as Model<IAbout>) ||
  mongoose.model<IAbout>("About", AboutSchema);

export type { AboutInput };
