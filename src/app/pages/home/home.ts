import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PlaylistService, Playlist } from '../../core/services/playlist';
import { PlaylistCardComponent } from '../../components/playlist-card/playlist-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PlaylistCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  playlists: Playlist[] = [];
  showForm = false;
  newPlaylistName = '';
  newPlaylistDescription = '';
  userName = '';

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlists = this.playlistService.getPlaylists();
    const user = this.authService.getCurrentUser();
    this.userName = user ? user.name : '';
  }

  createPlaylist(): void {
    if (this.newPlaylistName.trim()) {
      this.playlistService.createPlaylist(
        this.newPlaylistName,
        this.newPlaylistDescription
      );
      this.playlists = this.playlistService.getPlaylists();
      this.newPlaylistName = '';
      this.newPlaylistDescription = '';
      this.showForm = false;
    }
  }

  deletePlaylist(id: string): void {
    this.playlistService.deletePlaylist(id);
    this.playlists = this.playlistService.getPlaylists();
  }

  openPlaylist(id: string): void {
    this.router.navigate(['/playlist', id]);
  }

  logout(): void {
    this.authService.logout();
  }
}