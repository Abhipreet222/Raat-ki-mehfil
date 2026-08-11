export interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  coverUrl: string;
  duration?: number;
}

export interface Playlist {
  slug: string;
  displayName: string;
  songs: Track[];
}

export interface PlaylistMeta {
  slug: string;
  displayName: string;
}
