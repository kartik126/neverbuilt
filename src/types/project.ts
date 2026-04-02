export interface GraveyardProject {
  id: string | number;
  created_at: string;
  user_id: string;
  x_handle: string | null;
  x_avatar_url: string | null;
  name: string;
  idea: string;
  details: string | null;
  world_x: number;
  world_y: number;
}

