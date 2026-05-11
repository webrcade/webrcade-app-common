import React, { Component, Fragment } from 'react';

import { EditorScreen } from '../../editor';
import { FieldsTab, FieldSpan } from '../../editor/tabs';
import { EmojiEventsWhiteImage, LockWhiteImage } from '../../../../images';
import { WebrcadeContext } from '../../../context/webrcadecontext';
import { achievements } from '../../../../achievements';

import styles from './achievements-styles.scss';

// ─── AchievementTab ──────────────────────────────────────────────────────────

class AchievementTab extends FieldsTab {
  focusFirst() {}
  focusLast() {}

  componentDidMount() {
    const { setFocusGridComps, isActive } = this.props;
    if (isActive) setFocusGridComps([]);
  }

  componentDidUpdate(prevProps) {
    const { setFocusGridComps, isActive } = this.props;
    if (isActive && isActive !== prevProps.isActive) {
      setFocusGridComps([]);
    }
  }

  render() {
    const { items, emptyMessage } = this.props;

    if (!items || items.length === 0) {
      return <FieldSpan>{emptyMessage || 'No achievements found'}</FieldSpan>;
    }

    return (
      <div className={styles['ach-list']}>
        {items.map((ach) => {
          const unlocked = achievements.isUnlocked(ach.id);
          const badgeUrl = ach.badgeName ? achievements.getBadgeUrl(ach.badgeName) : null;

          return (
            <div key={ach.id} className={styles['ach-row']}>
              <div className={styles['ach-badge']}>
                {badgeUrl ? (
                  <div className={styles['ach-badge-wrap']}>
                    <img
                      src={badgeUrl}
                      alt=""
                      className={styles['ach-badge-img'] + (!unlocked ? ' ' + styles['ach-badge-img--locked'] : '')}
                    />
                    {!unlocked && (
                      <img
                        src={LockWhiteImage}
                        alt="locked"
                        className={styles['ach-badge-lock']}
                      />
                    )}
                  </div>
                ) : (
                  <div className={styles['ach-badge-placeholder']} />
                )}
              </div>
              <div className={styles['ach-info']}>
                <div className={styles['ach-title']}>{ach.title}</div>
                <div className={styles['ach-desc']}>{ach.description}</div>
                <div className={styles['ach-footer']}>
                  <span
                    className={
                      styles['ach-points'] +
                      (unlocked ? ' ' + styles['ach-points--unlocked'] : '')
                    }
                  >
                    {ach.points} PTS
                  </span>
                  {unlocked && (
                    <span className={styles['ach-status']}>✓ Unlocked</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
AchievementTab.contextType = WebrcadeContext;

// ─── AchievementsScreen ───────────────────────────────────────────────────────

export class AchievementsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabIndex: null,
      focusGridComps: null,
    };
    this.tabRefs = [React.createRef(), React.createRef(), React.createRef()];
  }

  render() {
    const { onClose } = this.props;
    const { tabIndex, focusGridComps } = this.state;

    const all = achievements.getAchievements();
    const unlockedCount = achievements.getUnlockedCount();
    const totalPts = achievements.getTotalPoints();
    const unlockedPts = achievements.getUnlockedPoints();

    const unlocked = all.filter(a => achievements.isUnlocked(a.id));
    const locked = all.filter(a => !achievements.isUnlocked(a.id));
    const allSorted = [...unlocked, ...locked];

    const setFocusGridComps = (comps) => this.setState({ focusGridComps: comps });

    const pct = (totalPts > 0) ? Math.round((unlockedPts / totalPts) * 100) : 0;
    const progressBar = totalPts > 0 ? (
      <div className={styles['ach-progress']}>
        <div className={styles['ach-progress__bar']}>
          <div className={styles['ach-progress__fill']} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles['ach-progress__label']}>
            <span className={styles['ach-progress__label-pct']}>{pct}%</span>
            {` (${unlockedPts}/${totalPts} points)`}
          </span>
      </div>
    ) : null;

    const tabDefs = [
      {
        label: 'Achievements',
        items: allSorted,
        emptyMessage: 'No achievements found',
      },
      {
        label: `Unlocked (${unlockedCount})`,
        items: unlocked,
        emptyMessage: 'No achievements unlocked',
      },
      {
        label: `Locked (${all.length - unlockedCount})`,
        items: locked,
        emptyMessage: 'All achievements unlocked!',
      },
    ];

    return (
      <EditorScreen
        subheader={progressBar}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={tabDefs.map(({ label, items }, i) => ({
          image: EmojiEventsWhiteImage,
          label: label,
          content: (
            <AchievementTab
              ref={this.tabRefs[i]}
              items={items}
              emptyMessage={tabDefs[i].emptyMessage}
              isActive={tabIndex === i}
              setFocusGridComps={setFocusGridComps}
            />
          ),
        }))}
      />
    );
  }
}
