export type Role = "superadmin" | "pastor" | "admin" | "member";
export type Member = {
  id: string;
  user_id: string | null;
  status: "pending" | "active" | "declined" | "inactive";
  role: Role;
  name_ko: string;
  name_en: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  birthday: string | null;
  baptized_on: string | null;
  church_title: string | null;
  is_newcomer: boolean;
  household_id: string | null;
  group_id: string | null;
  request_note: string | null;
  directory_listed: boolean;
  directory_phone: boolean;
  directory_email: boolean;
  directory_address: boolean;
  created_at: string;
  approved_at: string | null;
};

export type Group = {
  id: string;
  name_ko: string;
  name_en: string | null;
  leader_id: string | null;
  meeting: string | null;
  location: string | null;
};
export type Household = { id: string; name: string };
export type GroupPost = {
  id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
};
export type Announcement = {
  id: string;
  kind: "news" | "bulletin";
  title_ko: string;
  title_en: string | null;
  body_ko: string | null;
  body_en: string | null;
  file_path: string | null;
  pinned: boolean;
  is_public: boolean;
  published_on: string;
};
export type ChurchEvent = {
  id: string;
  title_ko: string;
  title_en: string | null;
  details_ko: string | null;
  details_en: string | null;
  location: string | null;
  starts_at: string;
  rsvp: boolean;
  capacity: number | null;
  is_public: boolean;
};
export type Rsvp = { event_id: string; member_id: string; member_name: string; people: number; note: string | null };
export type Sermon = {
  id: string;
  title_ko: string;
  title_en: string | null;
  scripture: string | null;
  preacher: string | null;
  preached_on: string;
  youtube_id: string | null;
};
export type Prayer = {
  id: string;
  author_id: string;
  author_name: string;
  visibility: "pastor" | "group" | "church";
  body: string;
  answered: boolean;
  created_at: string;
  prayer_supports: { member_id: string }[];
};
export type Slot = {
  id: string;
  team: string;
  serve_on: string;
  member_id: string | null;
  member_name: string;
  status: "open" | "assigned" | "confirmed" | "swap";
};
export type Visit = { id: string; name: string; contact: string; message: string | null; handled: boolean; created_at: string };
export type CareNote = {
  id: string;
  member_id: string;
  kind: "visit" | "hospital" | "call" | "followup";
  body: string;
  remind_on: string | null;
  done: boolean;
  created_at: string;
};
export type Child = {
  id: string;
  guardian_id: string;
  name: string;
  birthday: string | null;
  allergies: string | null;
  notes: string | null;
  pickup: string | null;
};
export type Checkin = { child_id: string; service_on: string; code: string; out_at: string | null };
export type RosterChild = Child & {
  guardian: string;
  guardian_phone: string | null;
  code: string | null;
  in_at: string | null;
  out_at: string | null;
  picked_up_by: string | null;
};
export type Gift = {
  id: string;
  member_id: string;
  name?: string;
  given_on: string;
  amount: number;
  fund: string;
  method: string | null;
};
