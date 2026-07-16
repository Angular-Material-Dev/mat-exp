import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface HeadlinePart {
  text: string;
  italic?: boolean;
}

export interface FeatureSubFeature {
  title: string;
  description: string;
}

export interface FeatureDialogData {
  headline: HeadlinePart[];
  imageUrl: string;
  imageAlt: string;
  subFeatures: FeatureSubFeature[];
}

@Component({
  selector: 'app-feature-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatIconButton, MatIcon],
  templateUrl: './feature-dialog.component.html',
  styleUrl: './feature-dialog.component.scss',
})
export class FeatureDialogComponent {
  protected readonly data = inject<FeatureDialogData>(MAT_DIALOG_DATA);
}
