/** Editable About-page content, managed from the admin dashboard. */

export interface SkillGroup {
  group: string;
  icon: string;
  items: string[];
}

export interface JourneyItem {
  year: string;
  title: string;
  body: string;
  /** Only starred milestones appear on the public About page (max 4). */
  featured: boolean;
}

export interface AboutContent {
  _id: string;
  intro: string;
  skills: SkillGroup[];
  journey: JourneyItem[];
}

export type AboutInput = Omit<AboutContent, "_id">;
