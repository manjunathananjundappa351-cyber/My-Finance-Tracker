export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagCreatePayload {
  name: string;
  color?: string;
}
