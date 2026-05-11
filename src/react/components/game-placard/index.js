import React, { Component } from 'react';
import styles from './style.scss';
import { getProxyToUrl } from '../../../app/fetch';
import { achievements } from '../../../achievements';

const GAME_BADGE_BASE_URL = 'https://media.retroachievements.org/Images/';
const USER_PIC_BASE_URL = 'https://media.retroachievements.org/UserPic/';
const HOLD_MS = 5000;
const FADE_MS = 400;

let _instance = null;

export function showGamePlacard(gameTitle, gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, gameTags) {
  if (_instance) {
    _instance.show(gameTitle, gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, gameTags);
  }
}

export class GamePlacard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: null,
      phase: null, // 'show' | 'hide' | null
    };
    this.timer = null;
  }

  componentDidMount() {
    _instance = this;
  }

  componentWillUnmount() {
    _instance = null;
    if (this.timer) clearTimeout(this.timer);
  }

  show(gameTitle, gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, gameTags = []) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.setState({
      current: { gameTitle, gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, gameTags },
      phase: 'show',
    });
    this.timer = setTimeout(() => {
      this.setState({ phase: 'hide' });
      this.timer = setTimeout(() => {
        this.setState({ current: null, phase: null });
        this.timer = null;
      }, FADE_MS);
    }, HOLD_MS);
  }

  render() {
    const { current, phase } = this.state;
    if (!current || !phase) return null;

    const { gameTitle, gameBadgeName, unlockedCount, totalCount, unlockedPoints, totalPoints, gameTags } = current;
    const badgeUrl = gameBadgeName
      ? getProxyToUrl(`${GAME_BADGE_BASE_URL}${gameBadgeName}`)
      : null;

    const username = achievements.getUsername();
    const avatarUrl = username
      ? getProxyToUrl(`${USER_PIC_BASE_URL}${username}.png`)
      : null;

    const subtitle = totalCount > 0
      ? `${unlockedCount} of ${totalCount} achievements \u00b7 ${unlockedPoints} of ${totalPoints} pts`
      : null;

    return (
      <div className={`${styles['game-placard']} ${styles[phase]}`}>
        {badgeUrl && (
          <img
            className={styles['game-placard__badge']}
            src={badgeUrl}
            alt=""
          />
        )}
        <div className={styles['game-placard__info']}>
          <span className={styles['game-placard__title']}>{gameTitle}</span>
          {gameTags && gameTags.length > 0 && (
            <div className={styles['game-placard__tags']}>
              {gameTags.map(tag => (
                <span key={tag} className={styles['game-placard__tag']}>{tag}</span>
              ))}
            </div>
          )}
          {subtitle && (
            <span className={styles['game-placard__subtitle']}>{subtitle}</span>
          )}
        </div>
        {(avatarUrl || username) && (
          <div className={styles['game-placard__user']}>
            {avatarUrl && (
              <img
                className={styles['game-placard__avatar']}
                src={avatarUrl}
                alt=""
              />
            )}
            {username && (
              <span className={styles['game-placard__username']}>{username}</span>
            )}
          </div>
        )}
      </div>
    );
  }
}
