import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlaylistService, Playlist, Song } from '../../core/services/playlist';
import { SongItemComponent } from '../../components/song-item/song-item';
import { PlayerComponent } from '../../components/player/player';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SongItemComponent, PlayerComponent],
  templateUrl: './playlist-detail.html',
  styleUrl: './playlist-detail.scss'
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  playlist: Playlist | undefined;
  currentSong: Song | null = null;
  isPlaying = false;
  showForm = false;
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  private audio = new Audio();
  private searchTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.playlist = this.playlistService.getPlaylistById(id);
    }
  }

  ngOnDestroy(): void {
    this.audio.pause();
    this.audio.src = '';
  }

  searchSongs(): void {
    clearTimeout(this.searchTimeout);
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    this.isSearching = true;
    this.searchTimeout = setTimeout(() => {
      fetch(`https://corsproxy.io/?https://api.deezer.com/search?q=${encodeURIComponent(this.searchQuery)}&limit=5`) 
        .then(res => res.json())
        .then(data => {
          this.searchResults = data.data || [];
          this.isSearching = false;
        })
        .catch(() => {
          this.isSearching = false;
        });
    }, 500);
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  addSongFromSearch(result: any): void {
    if (this.playlist) {
      const song = {
        title: result.title,
        artist: result.artist.name,
        duration: this.formatDuration(result.duration),
        audioUrl: result.preview,
        coverUrl: result.album.cover_small
      };
      this.playlistService.addSong(this.playlist.id, song);
      this.playlist = this.playlistService.getPlaylistById(this.playlist.id);
      this.searchQuery = '';
      this.searchResults = [];
      this.showForm = false;
    }
  }

  playSong(song: Song): void {
    if (this.currentSong?.id === song.id) {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.audio.play();
      } else {
        this.audio.pause();
      }
    } else {
      this.audio.pause();
      this.currentSong = song;
      if (song.audioUrl) {
        this.audio.src = song.audioUrl;
        this.audio.play();
        this.isPlaying = true;
      } else {
        this.isPlaying = true;
      }
    }
  }

  deleteSong(songId: string): void {
    if (this.playlist) {
      this.playlistService.deleteSong(this.playlist.id, songId);
      this.playlist = this.playlistService.getPlaylistById(this.playlist.id);
      if (this.currentSong?.id === songId) {
        this.audio.pause();
        this.currentSong = null;
        this.isPlaying = false;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }
}