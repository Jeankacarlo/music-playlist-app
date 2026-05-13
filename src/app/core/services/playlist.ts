import { Injectable } from '@angular/core';

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
  coverUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private playlists: Playlist[] = [
    {
      id: '1',
      name: 'Mis Favoritas',
      description: 'Las mejores canciones',
      coverUrl: 'https://picsum.photos/seed/playlist1/200',
      songs: []
    },
    {
      id: '2',
      name: 'Rock Clásico',
      description: 'Rock de todos los tiempos',
      coverUrl: 'https://picsum.photos/seed/playlist2/200',
      songs: []
    }
  ];

  getPlaylists(): Playlist[] {
    return this.playlists;
  }

  getPlaylistById(id: string): Playlist | undefined {
    return this.playlists.find(p => p.id === id);
  }

  createPlaylist(name: string, description: string): void {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      coverUrl: `https://picsum.photos/seed/${Date.now()}/200`,
      songs: []
    };
    this.playlists.push(newPlaylist);
  }

  deletePlaylist(id: string): void {
    this.playlists = this.playlists.filter(p => p.id !== id);
  }

  addSong(playlistId: string, song: Omit<Song, 'id'>): void {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      playlist.songs.push({ ...song, id: Date.now().toString() });
    }
  }

  deleteSong(playlistId: string, songId: string): void {
    const playlist = this.getPlaylistById(playlistId);
    if (playlist) {
      playlist.songs = playlist.songs.filter(s => s.id !== songId);
    }
  }
}