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

  @Output() onPlay = new EventEmitter<Song>();
  @Output() onDelete = new EventEmitter<string>();

  play(): void {
    this.onPlay.emit(this.song);
  }

  delete(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.song.id);
  }
}