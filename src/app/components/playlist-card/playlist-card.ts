import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Playlist } from '../../core/services/playlist';
@Component({
  selector: 'app-playlist-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playlist-card.html',
  styleUrl: './playlist-card.scss'
})
export class PlaylistCardComponent {
  @Input() playlist!: Playlist;
  @Output() onOpen = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  open(): void {
    this.onOpen.emit(this.playlist.id);
  }

  delete(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.playlist.id);
  }
}