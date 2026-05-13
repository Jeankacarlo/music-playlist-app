import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Song } from '../../core/services/playlist';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
  styleUrl: './player.scss'
})
export class PlayerComponent {
  @Input() song!: Song;
  @Input() isPlaying = false;
  @Output() onTogglePlay = new EventEmitter<void>();

  togglePlay(): void {
    this.onTogglePlay.emit();
  }
}