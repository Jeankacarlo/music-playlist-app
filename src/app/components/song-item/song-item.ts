import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../core/services/playlist';

@Component({
  selector: 'app-song-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-item.html',
  styleUrl: './song-item.scss'
})
export class SongItemComponent {
  @Input() song!: Song;
  @Input() index!: number;
  @Input() isPlaying = false;
  @Input() canModify = true;

  @Output() onPlay = new EventEmitter<Song>();
  @Output() onDelete = new EventEmitter<string>();

  confirmingDelete = false;

  play(): void {
    this.onPlay.emit(this.song);
  }

  requestDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmingDelete = true;
  }

  cancelDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmingDelete = false;
  }

  confirmDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.confirmingDelete = false;
    if (this.canModify) {
      this.onDelete.emit(this.song.id);
    }
  }
}