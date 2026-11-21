import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SAFETY_FLAG_LABELS, SAFETY_FLAGS } from './activities';
import { CRISIS_ROUTES } from '../data/crisis-routes';

/**
 * The app copies the crisis routes and the safety flag labels (APP-001). These
 * checks fail when the website wording changes and the app copy is not updated.
 */
const crisisDart = readFileSync(new URL('../../../lib/features/activity_cards/data/crisis_routes.dart', import.meta.url), 'utf8');
const labelsDart = readFileSync(new URL('../../../lib/features/activity_cards/data/safety_flag_labels.dart', import.meta.url), 'utf8');

describe('app copies of website wording (APP-001)', () => {
  it('has every crisis route text in the app crisis file', () => {
    for (const route of CRISIS_ROUTES) {
      for (const text of [route.region, route.lead, route.emphasis ?? '', route.tail]) {
        if (text === '') continue;
        expect(crisisDart, `missing from crisis_routes.dart: ${text}`).toContain(`'${text}'`);
      }
    }
  });

  it('has every shown safety flag label in the app label file', () => {
    for (const flag of SAFETY_FLAGS) {
      if (flag === 'none') continue;
      const label = SAFETY_FLAG_LABELS[flag];
      expect(labelsDart, `missing label for ${flag}`).toContain(`'${label}'`);
    }
  });
});
