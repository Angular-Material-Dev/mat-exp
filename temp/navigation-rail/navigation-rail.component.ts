import { Component, model } from '@angular/core';
import { cx } from '../../../../utils/functions/cx';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector:
    'ngm-dev-block-paid-application-multi-column-full-width-with-narrow-sidebar-navigation-rail',
  templateUrl: './navigation-rail.component.html',
  styleUrls: ['./navigation-rail.component.scss'],
  imports: [MatIconModule],
})
export class FullWidthWithNarrowSidebarNavigationRailComponent {
  menuItems =
    model.required<
      { id: string; label: string; icon: string; isActive?: boolean }[]
    >();

  readonly cx = cx;

  makeActive(id: string) {
    this.menuItems.update(items =>
      items.map(item => ({
        ...item,
        isActive: item.id === id,
      }))
    );
  }
}
