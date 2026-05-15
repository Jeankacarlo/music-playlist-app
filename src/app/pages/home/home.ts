import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PlaylistService, Playlist } from '../../core/services/playlist';
import { PlaylistCardComponent } from '../../components/playlist-card/playlist-card';
import { PlaylistDetailComponent } from '../playlist-detail/playlist-detail';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PlaylistCardComponent, PlaylistDetailComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  activePlaylists: Playlist[] = [];
  blockedPlaylists: Playlist[] = [];
  showCreateModal = false;
  showDetailModal = false;
  selectedPlaylist: Playlist | undefined;
  selectedView: 'playlists' | 'search' = 'playlists';
  newPlaylistName = '';
  newPlaylistDescription = '';
  userName = '';
  private searchTimeout: any;
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  selectedPlaylistToAddId?: string;
  showAddMessage = false;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshPlaylists();
    const user = this.authService.getCurrentUser();
    this.userName = user ? user.name : '';
  }

  refreshPlaylists(): void {
    this.activePlaylists = this.playlistService.getActivePlaylists();
    this.blockedPlaylists = this.playlistService.getBlockedPlaylists();
    if (!this.selectedPlaylistToAddId && this.activePlaylists.length > 0) {
      this.selectedPlaylistToAddId = this.activePlaylists[0].id;
    }
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  searchSongs(): void {
    clearTimeout((this as any).searchTimeout);
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    this.isSearching = true;
    (this as any).searchTimeout = setTimeout(() => {
      fetch(`https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(this.searchQuery)}&limit=6`)
        .then(res => res.json())
        .then(data => {
          this.searchResults = data.data || [];
          this.isSearching = false;
        })
        .catch(() => {
          this.isSearching = false;
        });
    }, 400);
  }

  addSongToPlaylist(result: any): void {
    if (!this.selectedPlaylistToAddId) {
      return;
    }

    const song = {
      title: result.title,
      artist: result.artist.name,
      duration: this.formatDuration(result.duration),
      audioUrl: result.preview,
      coverUrl: result.album.cover_small
    };

    this.playlistService.addSong(this.selectedPlaylistToAddId, song);
    this.showAddMessage = true;
    setTimeout(() => {
      this.showAddMessage = false;
    }, 3000);
  }

  createPlaylist(): void {
    if (this.newPlaylistName.trim()) {
      this.playlistService.createPlaylist(
        this.newPlaylistName,
        this.newPlaylistDescription
      );
      this.refreshPlaylists();
      this.newPlaylistName = '';
      this.newPlaylistDescription = '';
      this.showCreateModal = false;
    }
  }

  deletePlaylist(id: string): void {
    this.playlistService.deletePlaylist(id);
    if (this.selectedPlaylist?.id === id) {
      this.closeDetail();
    }
    this.refreshPlaylists();
  }

  openPlaylist(id: string): void {
    this.selectedPlaylist = this.playlistService.getPlaylistById(id);
    if (this.selectedPlaylist) {
      this.showDetailModal = true;
    }
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedPlaylist = undefined;
    this.refreshPlaylists();
  }

  getUserInitials(): string {
    if (!this.userName) {
      return 'U';
    }
    return this.userName
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}