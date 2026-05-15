import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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
export class PlaylistDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() playlistId?: string;
  @Input() modalMode = false;
  @Output() onClose = new EventEmitter<void>();

  playlist: Playlist | undefined;
  currentSong: Song | null = null;
  isPlaying = false;
  showForm = false;
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  private audio = new Audio();
  private searchTimeout: any;
  showDeleteMessage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    if (this.playlistId) {
      this.loadPlaylist(this.playlistId);
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlaylist(id);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playlistId'] && this.playlistId) {
      this.loadPlaylist(this.playlistId);
    }
  }

  private loadPlaylist(id: string): void {
    this.playlist = this.playlistService.getPlaylistById(id);
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
    if (this.playlist && !this.playlist.isBlocked) {
      const song = {
        title: result.title,
        artist: result.artist.name,
        duration: this.formatDuration(result.duration),
        audioUrl: result.preview,
        coverUrl: result.album.cover_small
      };
      this.playlistService.addSong(this.playlist.id, song);
      this.loadPlaylist(this.playlist.id);
      this.searchQuery = '';
      this.searchResults = [];
      this.showForm = false;
    }
  }

  playSong(song: Song): void {
    if (this.currentSong?.id === song.id) {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.audio.play().catch(err => {
          console.error('[PlaylistDetail] audio play failed', err);
          this.isPlaying = false;
        });
      } else {
        this.audio.pause();
      }
      return;
    }

    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentSong = song;

    if (song.audioUrl) {
      this.audio.src = song.audioUrl;
      this.audio.load();
      this.audio.play().then(() => {
        this.isPlaying = true;
      }).catch(err => {
        console.error('[PlaylistDetail] audio play failed', err);
        this.isPlaying = false;
      });
    } else {
      this.isPlaying = true;
    }
  }

  deleteSong(songId: string): void {
    if (this.playlist && !this.playlist.isBlocked) {
      this.playlistService.deleteSong(this.playlist.id, songId);
      this.loadPlaylist(this.playlist.id);
      this.showDeleteMessage = true;
      setTimeout(() => {
        this.showDeleteMessage = false;
      }, 3000);
      if (this.currentSong?.id === songId) {
        this.audio.pause();
        this.currentSong = null;
        this.isPlaying = false;
      }
    }
  }

  goBack(): void {
    if (this.modalMode) {
      this.onClose.emit();
    } else {
      this.router.navigate(['/home']);
    }
  }

  togglePlay(): void {
    if (!this.currentSong) {
      return;
    }

    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.audio.play().catch(err => {
        console.error('[PlaylistDetail] audio play failed', err);
        this.isPlaying = false;
      });
    } else {
      this.audio.pause();
    }
  }
}
